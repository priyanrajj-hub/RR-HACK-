import pandas as pd, numpy as np
from sklearn.ensemble import HistGradientBoostingClassifier as HC, HistGradientBoostingRegressor as HR
b=pd.read_csv('ball_by_ball.csv',low_memory=False); m=pd.read_csv('matches.csv'); t=pd.read_csv('teams.csv').drop_duplicates('team_id')
b=b[b.innings.isin([1,2])].merge(m[['match_id','win_team_id','match_date','knock_out','revised_target','first_inn_revised_overs','second_inn_revised_overs']],on='match_id')
b=b[b.revised_target.isna()&b.first_inn_revised_overs.isna()&b.second_inn_revised_overs.isna()]
b['et']=b.extras_type.fillna('none')
b['wide']=b.et.eq('wide'); b['nb']=b.et.isin(['Overstep','other'])
b['legal']=~(b.wide|b.nb|b.et.eq('Penalty'))
b['faced']=~(b.wide|b.et.eq('Penalty'))
b['tot']=b.runs+b.extras1_runs+b.extras_2_runs
b['brun']=b.runs+np.where(b.wide|b.nb,b.extras1_runs+b.extras_2_runs,0)
b['bat_out']=(b.is_wicket)&(b.dismissed_player_id==b.striker_id)&(~b.dismissal_type.isin(['Retire Out']))
b['bowl_w']=b.is_wicket&b.dismissal_type.isin(['Caught','Bowled','LBW','Stump','Hit Wicket'])
b['team_w']=b.is_wicket&(~b.dismissal_type.eq('Retire Out'))
b=b.sort_values(['match_id','innings','innings_ball_num']).reset_index(drop=True)
g=b.groupby(['match_id','innings'])
b['runs_before']=g.tot.cumsum()-b.tot; b['w_before']=g.team_w.cumsum()-b.team_w.astype(int)
b['lb_before']=g.legal.cumsum()-b.legal.astype(int)
tgt=b[b.innings==1].groupby('match_id').tot.sum()+1
b['target']=b.match_id.map(tgt)
ch=b.innings==2
b['balls_left']=np.clip(120-b.lb_before,1,120); b['need']=b.target-b.runs_before
b['rrr']=b.need/b.balls_left*6; b['crr']=np.where(b.lb_before>0,b.runs_before/np.maximum(b.lb_before,1)*6,0)
b['over']=b.overid.clip(upper=20)
# win prob model for chase
c=b[ch].copy(); c['y']=(c.win_team_id==c.batting_team_id).astype(int)
F=['need','balls_left','w_before','rrr','crr']
wp=HC(max_depth=4,max_iter=150,learning_rate=0.08).fit(c[F],c.y)
p=wp.predict_proba(c[F])[:,1]
close=1-np.abs(2*p-1); late=0.6+0.4*(1-c.balls_left/120)
b.loc[ch,'PI']=(close*late).values
b.loc[ch,'wp']=p
# innings 1: collapse + death
med=b[b.innings==1].groupby(['over','w_before']).size().unstack(fill_value=0)
expw=b[b.innings==1].groupby('over').w_before.median()
i1=b.innings==1
coll=np.clip((b.w_before-b.over.map(expw))/3,0,1)
death=(b.over>=16).astype(float); pp=((b.over<6)&(b.w_before>=2)).astype(float)
b.loc[i1,'PI']=(0.5*coll+0.3*death+0.2*pp)[i1]
b['PI']=b.PI.fillna(0)
thr=b.PI.quantile(0.75); b['hp']=b.PI>=thr
print('PI thr',thr,'hp share',b.hp.mean())
# expected value models; opposition identity included as categorical so players are judged vs opponent quality
b['pace']=(b.pace_or_spin=='Pace').astype(int); b['bo']=b.batting_order.fillna(6)
Xb=['over','w_before','innings','pace','bo','lb_before','bowling_team_id']
Xw=['over','w_before','innings','pace','bo','lb_before','batting_team_id']
kb=dict(max_depth=4,max_iter=120,categorical_features=[Xb.index('bowling_team_id')])
kw=dict(max_depth=4,max_iter=120,categorical_features=[Xw.index('batting_team_id')])
b['xr']=HR(**kb).fit(b.loc[b.faced,Xb],b.loc[b.faced,'runs']).predict(b[Xb])
b['xw']=HC(**kb).fit(b[Xb],b.bat_out).predict_proba(b[Xb])[:,1]
WV=25.0
b['bv']=np.where(b.faced,(b.runs-b.xr)-WV*(b.bat_out-b.xw),0)
b['xrb']=HR(**kw).fit(b.loc[b.legal,Xw],b.loc[b.legal,'brun']).predict(b[Xw])
b['xwb']=HC(**kw).fit(b[Xw],b.bowl_w).predict_proba(b[Xw])[:,1]
b['wv']=-(b.brun-b.xrb)+WV*(b.bowl_w-b.xwb)
b.to_pickle('/tmp/out/b.pkl')
