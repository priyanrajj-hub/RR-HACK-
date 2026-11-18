import pandas as pd, numpy as np
b=pd.read_pickle('b.pkl'); t=pd.read_csv('/tmp/dp/Data Pack/teams.csv').drop_duplicates('team_id').set_index('team_id').team_name
print(b.groupby('hp').apply(lambda d:pd.Series({'RPB':d.tot.sum()/d.legal.sum(),'wkt%':d.team_w.mean()*100,'dot%':(d.tot==0).mean()*100})))
K=150
def rate(role,minb,seed=None,df=None):
    d=b if df is None else df
    if role=='bat': idc,nm,ok,val='striker_id','striker_name','faced','bv'
    else: idc,nm,ok,val='bowler_id','bowler_name','legal','wv'
    d=d[d[ok]]
    pm=d.groupby([idc,'match_id','hp']).agg(v=(val,'sum'),n=(val,'size')).reset_index()
    hp=pm[pm.hp]; lo=pm[~pm.hp]
    A=hp.groupby(idc).agg(hn=('n','sum'),hv=('v','sum'),hm=('match_id','nunique'))
    A['pos']=hp[hp.n>=6].assign(p=lambda x:x.v>0).groupby(idc).p.agg(['mean','size']).eval('mean')
    A['pn']=hp[hp.n>=6].groupby(idc).size()
    B=lo.groupby(idc).agg(ln=('n','sum'),lv=('v','sum'))
    A=A.join(B).fillna({'pos':0.5,'pn':0,'ln':0,'lv':0})
    A['hp100']=A.hv/(A.hn+K)*100
    A['base100']=A.lv/(A.ln+K)*100
    A['cons']=(A.pos*A.pn+0.5*5)/(A.pn+5)
    A['dr']=np.minimum(0,A.hp100-A.base100)  # penalty if worse than own baseline
    A=A[(A.hn>=minb)&(A.ln>=minb)]
    z=lambda s:(s-s.mean())/s.std()
    A['score']=0.6*z(A.hp100)+0.25*z(A.cons)+0.15*z(A.dr)
    return A,idc,nm
res={}
for role,minb in [('bat',120),('bowl',100)]:
    A,idc,nm=rate(role,minb)
    names=b.groupby(idc)[nm].last(); A['name']=names
    # team: most frequent
    col='batting_team_id' if role=='bat' else 'bowling_team_id'
    A['team']=b.groupby(idc)[col].agg(lambda s:s.value_counts().index[0]).map(t)
    print(role,'eligible',len(A))
    # split-half by match parity
    mid=sorted(b.match_id.unique()); od=b[b.match_id.isin(mid[::2])]; ev=b[b.match_id.isin(mid[1::2])]
    a1,_,_=rate(role,minb//2,df=od); a2,_,_=rate(role,minb//2,df=ev)
    j=a1.score.to_frame('a').join(a2.score.to_frame('b'),how='inner'); 
    sb=2*j.corr().iloc[0,1]/(1+j.corr().iloc[0,1])
    print(' split-half r=%.2f Spearman-Brown=%.2f n=%d'%(j.corr().iloc[0,1],sb,len(j)))
    # bootstrap over matches
    ms=b.match_id.unique(); rng=np.random.default_rng(1); ranks=[]
    top=A.sort_values('score',ascending=False).head(25).index
    for i in range(25):
        s=rng.choice(ms,len(ms)); w=pd.Series(s).value_counts()
        d=b[b.match_id.isin(w.index)].merge(w.rename('w'),left_on='match_id',right_index=True)
        d=d.loc[d.index.repeat(d.w)]
        try:
            r,_,_=rate(role,minb,df=d); r['rk']=r.score.rank(ascending=False); ranks.append(r.rk.reindex(top))
        except Exception as e: pass
    R=pd.concat(ranks,axis=1)
    A['rk_lo']=R.quantile(.05,axis=1); A['rk_hi']=R.quantile(.95,axis=1); A['top10_prob']=(R<=10).mean(axis=1)
    A=A.sort_values('score',ascending=False)
    res[role]=A
    cols=['name','team','hn','hm','hp100','base100','cons','score','rk_lo','rk_hi','top10_prob']
    print(A[cols].head(15).round(2).to_string())
    A.to_csv(f'{role}.csv')
