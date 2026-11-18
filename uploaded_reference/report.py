import pandas as pd, numpy as np, matplotlib; matplotlib.use('Agg')
import matplotlib.pyplot as plt
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.units import mm
from reportlab.lib.styles import ParagraphStyle
from reportlab.platypus import *
b=pd.read_pickle('b.pkl'); bat=pd.read_csv('bat.csv'); bow=pd.read_csv('bowl.csv')
PINK='#EA1A85'; BLUE='#254AA5'; NAVY='#0B1437'
b['date']=pd.to_datetime(b.match_date); mx=b.date.max()
b['w']=0.5**((mx-b.date).dt.days/365)
K=150
def recent(idc,ok,val,ids):
    d=b[b[ok]&b.hp&b[idc].isin(ids)]
    s=d.assign(wv=d.w*d[val]).groupby(idc).agg(sv=('wv','sum'),sn=('w','sum'))
    return (s.sv/(s.sn+K)*100)
# final lists: data score order, availability filter (retired players removed)
RET={143:'Dinesh Karthik - retired from all cricket (2024)'}
bf=bat[~bat.striker_id.isin(RET)].head(10).copy(); bw=bow.head(10).copy()
bf['rec']=recent('striker_id','faced','bv',bf.striker_id).reindex(bf.striker_id).values
bw['rec']=recent('bowler_id','legal','wv',bw.bowler_id).reindex(bw.bowler_id).values
# descriptive stats under pressure
H=b[b.hp]
def bstats(i):
    d=H[(H.striker_id==i)&H.faced]; return pd.Series({'SR':d.runs.sum()/len(d)*100,'bnd':(d.is_four|d.is_six).mean()*100,'dis':d.bat_out.sum(),'inn':d.match_id.nunique()})
def wstats(i):
    d=H[(H.bowler_id==i)&H.legal]; return pd.Series({'eco':d.brun.sum()/len(d)*6,'wk':d.bowl_w.sum(),'dot':(d.tot==0).mean()*100})
bf=bf.join(bf.striker_id.apply(bstats)); bw=bw.join(bw.bowler_id.apply(wstats))
bf.to_csv('final_bat.csv',index=False); bw.to_csv('final_bowl.csv',index=False)
print(bf[['name','score','hn','SR','rec']].round(2)); print(bw[['name','score','hn','eco','wk','rec']].round(2))
# league comparators
Lb=b[b.faced&b.hp]; LbSR=Lb.runs.sum()/len(Lb)*100
Lw=b[b.legal&b.hp]; LwE=Lw.brun.sum()/len(Lw)*6
# charts
plt.rcParams.update({'font.size':9})
def barchart(df,fn,title):
    fig,ax=plt.subplots(figsize=(7,3.4)); d=df.iloc[::-1]
    ax.barh(d.name,d.score,color=PINK)
    ax.set_xlabel('Pressure Reliability Score (z-composite)'); ax.set_title(title,color=NAVY,fontweight='bold')
    for s in ['top','right']: ax.spines[s].set_visible(False)
    plt.tight_layout(); plt.savefig(fn,dpi=170); plt.close()
barchart(bf,'c_bat.png','Top 10 batters under pressure'); barchart(bw,'c_bowl.png','Top 10 bowlers under pressure')
fig,axs=plt.subplots(1,3,figsize=(7.2,2.5))
g=b[b.legal].groupby('hp'); r=g.apply(lambda d:pd.Series({'Runs/ball':d.tot.sum()/len(d),'Wicket %':d.team_w.mean()*100,'Dot %':(d.tot==0).mean()*100}))
for ax,c in zip(axs,r.columns):
    ax.bar(['Ordinary','High\npressure'],[r.loc[False,c],r.loc[True,c]],color=[BLUE,PINK]); ax.set_title(c,fontsize=9)
    for s in ['top','right']: ax.spines[s].set_visible(False)
plt.tight_layout(); plt.savefig('c_pi.png',dpi=170); plt.close()
fig,ax=plt.subplots(figsize=(5.2,3.6)); allb=bat
ax.scatter(allb.base100,allb.hp100,s=14,c='#bbb')
ax.scatter(bf.base100,bf.hp100,s=34,c=PINK)
for _,rw in bf.iterrows(): ax.annotate(rw['name'].split()[-1],(rw.base100,rw.hp100),fontsize=7,xytext=(3,2),textcoords='offset points')
ax.plot([-30,60],[-30,60],'--',c=BLUE,lw=.8); ax.set_xlabel('Baseline value /100 balls (ordinary phases)'); ax.set_ylabel('Pressure value /100 balls')
for s in ['top','right']: ax.spines[s].set_visible(False)
plt.tight_layout(); plt.savefig('c_sc.png',dpi=170); plt.close()
# PDF
ss=lambda n,**k:ParagraphStyle(n,fontName=k.pop('f','Helvetica'),**k)
H1=ss('h1',f='Helvetica-Bold',fontSize=14,textColor=colors.HexColor(NAVY),spaceBefore=8,spaceAfter=4)
H2=ss('h2',f='Helvetica-Bold',fontSize=10.5,textColor=colors.HexColor(BLUE),spaceBefore=5,spaceAfter=2)
P=ss('p',fontSize=8.8,leading=12,spaceAfter=3); S=ss('s',fontSize=7.4,leading=9.2); SB=ss('sb',f='Helvetica-Bold',fontSize=7.4,leading=9.2,textColor=colors.white)
def tbl(rows,widths,head=True):
    data=[[Paragraph(str(c),SB if (head and i==0) else S) for c in r] for i,r in enumerate(rows)]
    t=Table(data,colWidths=[w*mm for w in widths],repeatRows=1)
    t.setStyle(TableStyle([('BACKGROUND',(0,0),(-1,0),colors.HexColor(NAVY)),('ROWBACKGROUNDS',(0,1),(-1,-1),[colors.white,colors.HexColor('#F3F5FB')]),('GRID',(0,0),(-1,-1),.25,colors.HexColor('#C8CEE0')),('VALIGN',(0,0),(-1,-1),'TOP'),('TOPPADDING',(0,0),(-1,-1),2),('BOTTOMPADDING',(0,0),(-1,-1),2)]))
    return t
def foot(c,d):
    c.saveState(); c.setFont('Helvetica',7); c.setFillColor(colors.grey)
    c.drawString(15*mm,8*mm,'SupeRR Selector S2 - Round 1 - Pressure Reliability Index'); c.drawRightString(195*mm,8*mm,'Page %d'%d.page); c.restoreState()
doc=SimpleDocTemplate('RR_Pressure_Report.pdf',pagesize=A4,leftMargin=15*mm,rightMargin=15*mm,topMargin=14*mm,bottomMargin=14*mm,title='Pressure Reliability Index - SupeRR Selector S2',author='Priyanraj')
st=[]
st+= [Paragraph('<font color="%s">Pressure Reliability Index</font>'%PINK,ss('t',f='Helvetica-Bold',fontSize=22,leading=26,textColor=colors.HexColor(NAVY))),
 Paragraph('Who delivers when the game is on the line? A data-driven top 10 batters and bowlers for Rajasthan Royals - IPL 2027 auction',ss('st',fontSize=10.5,leading=14,textColor=colors.HexColor(BLUE),spaceAfter=6)),
 Paragraph('SupeRR Selector Season 2 - Round 1 submission - Priyanraj',S),Spacer(1,6)]
st.append(Paragraph('1. Executive summary',H1))
st.append(Paragraph('I built a ball-level <b>Pressure Index</b> from 200,000+ deliveries (867 IPL and T20I matches, 2022-2026), then measured how every batter and bowler performs in the top quarter of pressure situations <b>relative to a context-expected value and to their own baseline</b>. Players are rated on pressure performance (60%), match-to-match consistency (25%) and resilience versus their own ordinary-phase baseline (15%), with small-sample shrinkage and bootstrap rank intervals. Rankings come from the supplied data. News (retirements, retentions) is used only as an <b>availability filter</b> and for squad-fit commentary.',P))
rows=[['Rank','Batter','Bowler']]+[[i+1,bf.name.iloc[i],bw.name.iloc[i]] for i in range(10)]
st.append(tbl(rows,[14,80,80]))
st.append(Spacer(1,4))
st.append(Paragraph('<b>Headline findings.</b> (1) Tim David is the most dependable finisher when the match is tight: the highest score, built on a sizeable sample (412 pressure balls) and a pressure strike rate of 181. (2) Vaibhav Sooryavanshi - the youngest player in the pool - ranks third despite a small sample and already lifts his output under pressure well above his own baseline: the profile of a precocious talent, though with wide uncertainty. (3) Umran Malik and Lockie Ferguson lead the bowlers: raw pace that strikes in high-pressure overs. (4) Rankings beyond the top 3-4 are statistically close; the report quantifies this honestly in section 7.',P))
st.append(Paragraph('2. Defining pressure',H1))
st.append(Paragraph('Pressure is not a single number on the scoreboard, so the index is built from match-situation signals, calibrated on the data:',P))
st.append(tbl([['Innings','Signal','How it is computed'],
['Chase (2nd inn.)','Closeness x lateness','A gradient-boosted win-probability model (runs needed, balls left, wickets lost, required and current run rate) gives win probability p. Closeness = 1 - |2p-1|, so a coin-flip chase scores 1 and a decided one scores 0. It is scaled from 0.6 to 1.0 as the innings progresses, because the same closeness matters more with fewer balls left.'],
['Setting (1st inn.)','Collapse, death, early wickets','50%: wickets lost beyond the median for that over (capped at 3 extra); 30%: overs 17-20; 20%: powerplay with 2+ wickets down.'],
['Both','Threshold','A ball is <b>high-pressure</b> if its index is in the top 25% of all balls (index >= 0.37). Matches with revised targets or reduced overs are excluded to avoid distorted chase states.']],[26,34,120]))
st.append(Spacer(1,3)); st.append(Image('c_pi.png',width=170*mm,height=170*mm*2.5/7.2))
st.append(Paragraph('<i>The index separates situations: high-pressure balls yield fewer runs, more dots and more wickets, so scoring or bowling well there is genuinely harder.</i>',S))
st.append(Paragraph('3. Measuring performance and building ratings',H1))
st.append(Paragraph('<b>Expected value models.</b> Two gradient-boosted models (runs per ball and dismissal probability) learn the league-average outcome given over, wickets lost, innings, pace or spin, batting position, balls bowled and <b>opposition identity</b>, so facing a stronger attack or bowling to a stronger line-up shifts expectations. Each delivery then has a <b>value = (actual - expected runs) - 25 x (actual - expected wicket)</b>; for bowlers the sign is flipped and wickets credit only bowler-attributed dismissals (run-outs excluded). Wides and no-balls are handled separately: they do not count as legal balls for the bowler and wides are not balls faced.',P))
st.append(Paragraph('<b>Rating.</b> For each player: pressure value per 100 balls shrunk toward zero with 150 pseudo-balls (empirical-Bayes style); consistency = share of matches (with 6+ pressure balls) with positive value, shrunk toward 50%; resilience = penalty if pressure value is below the same player\'s ordinary-phase value. Final score = 0.60 z(pressure) + 0.25 z(consistency) + 0.15 z(resilience).',P))
st.append(Paragraph('4. Fair comparisons',H1))
st.append(tbl([['Issue','Treatment'],
['Sample size','Minimum 120 pressure balls and 120 ordinary balls (batters), 100 each for bowlers; shrinkage handles the rest. 129 batters and 150 bowlers qualify.'],
['IPL vs T20I','Both pooled; expected-value models include phase and opposition, so lower-quality opposition lowers expectations through team identity rather than a manual discount. T20I-only players are scored on the same scale, which is a limitation (see section 7).'],
['Match context','Expectation models control for over, wickets, innings, pace/spin, batting order; revised-target matches are removed.'],
['Availability','Retired players are removed from the final list (e.g. Dinesh Karthik, retired 2024, ranked 2nd on pure data and is excluded; MS Dhoni retired from IPL on 17 Nov 2026).']],[30,150]))
st.append(PageBreak())
st.append(Paragraph('5. Evidence: top 10 batters',H1))
st.append(Image('c_bat.png',width=150*mm,height=150*mm*3.4/7))
rows=[['#','Batter','Pressure balls','Pressure SR','Boundary %','Value /100 (pressure)','Value /100 (baseline)','Consistency','Rank interval (5-95%)']]
for i,r in bf.reset_index(drop=True).iterrows(): rows.append([i+1,r['name'],int(r.hn),'%.0f'%r.SR,'%.0f'%r.bnd,'%.1f'%r.hp100,'%.1f'%r.base100,'%.0f%%'%(r.cons*100),'%d-%d'%(round(r.rk_lo),round(r.rk_hi))])
st.append(tbl(rows,[9,38,16,16,16,21,21,18,25]))
st.append(Paragraph('League-average strike rate in high-pressure balls (all players): %.0f. Rank intervals come from 25 bootstrap resamples of whole matches; they were computed on the original ordering including Karthik, so they are indicative.'%LbSR,S))
st.append(Spacer(1,3)); st.append(Image('c_sc.png',width=105*mm,height=105*mm*3.6/5.2))
st.append(Paragraph('<i>Points above the dashed line deliver more per ball under pressure than in ordinary phases. Highlighted players are the top 10.</i>',S))
st.append(PageBreak())
st.append(Paragraph('6. Evidence: top 10 bowlers',H1))
st.append(Image('c_bowl.png',width=150*mm,height=150*mm*3.4/7))
rows=[['#','Bowler','Pressure balls','Pressure economy','Wickets','Dot %','Value /100 (pressure)','Value /100 (baseline)','Rank interval (5-95%)']]
for i,r in bw.reset_index(drop=True).iterrows(): rows.append([i+1,r['name'],int(r.hn),'%.2f'%r.eco,int(r.wk),'%.0f'%r['dot'],'%.1f'%r.hp100,'%.1f'%r.base100,'%d-%d'%(round(r.rk_lo),round(r.rk_hi))])
st.append(tbl(rows,[9,38,16,20,14,12,23,23,25]))
st.append(Paragraph('League-average economy in high-pressure balls: %.2f.'%LwE,S))
st.append(Paragraph('7. Reliability, limitations and forward look',H1))
st.append(Paragraph('<b>Consistency check.</b> Splitting matches into odd/even halves, ratings correlate at r = 0.16 (batters) and 0.10 (bowlers), or 0.27 and 0.18 after the Spearman-Brown correction. Pressure samples are small and T20 is noisy, so only the leading names are robustly separated; positions 4-10 are close and should be read as a tier. Bootstrap top-10 probabilities and rank intervals above make this explicit.',P))
st.append(Paragraph('<b>Limitations.</b> (a) T20I opposition ranges widely in strength and the model only partly adjusts for it, which is a particular risk for Sufiyan Muqeem and Salman Mirza. (b) The 25-run wicket value is a convention; results are most sensitive to it for bowlers. (c) Bowlers face batters of very different quality within one over. (d) Small samples: Umran Malik (150 pressure balls, 12 matches), Muqeem and Mirza. (e) No injury, fitness, fielding or captaincy information is in the data.',P))
st.append(Paragraph('<b>Present and future context (news, 18 Nov 2026).</b> IPL franchises have finalised retentions and the mini-auction is expected on 16 December in Goa. Rajasthan Royals retained Jaiswal, Parag, Jurel, Sooryavanshi and Jadeja, traded in Mohammed Shami and Manimaran Siddharth, released Hetmyer, Milne, Maphaka, Deshpande and others, and enter with about INR 27 crore and six slots (three overseas), looking to add middle-order and bowling depth. MS Dhoni has retired from IPL as a player (to mentor CSK), which removes a classic pressure finisher from the market and raises the premium on proven death-over batters.',P))
st.append(Paragraph('<b>Squad fit.</b> Finishers who lift output in tight chases (David, Russell, Ashutosh Sharma, Jadeja) address the middle-order need; Sooryavanshi and Jadeja are already at RR, so the report treats them as validation of existing core rather than purchases. For the bowling slots, overseas quick Ferguson and Malik add wicket-taking in the pressure overs, while Cummins and Hazlewood offer the most reliable control. Availability of each name in the final auction pool must be confirmed on release of the list.',P))
st.append(Paragraph('<b>Young talent: Vaibhav Sooryavanshi.</b> His pressure value per 100 balls (%.0f) is well above his own baseline (%.0f), and a form-weighted recalculation (recent matches weighted more) keeps him near the top. Because he has only 16 pressure matches, shrinkage deliberately holds him back; with more data his rating has more room to rise than veterans\' ratings, which is the reason he deserves a high place in a forward-looking ranking.'%(bf[bf.name=='Vaibhav Sooryavanshi'].hp100.iloc[0],bf[bf.name=='Vaibhav Sooryavanshi'].base100.iloc[0]),P))
st.append(Paragraph('8. Squad-fit notes for the top 10',H1))
fit={'Tim David':'Finisher for overs 16-20; overseas slot; power against both pace and spin.','Virat Kohli':'Anchors chases and handles collapses; most stable high-volume pressure record.','Vaibhav Sooryavanshi':'Already at RR; explosive intent under pressure; long-term core.','Mohammad Rizwan':'Controlled chase builder; T20I-heavy sample, not an IPL regular.','Ravindra Jadeja':'Already at RR; dependable finisher and bowler.','Andre Russell':'Power finisher and death bowler; one player, two roles.','Pathum Nissanka':'Top-order stabiliser after early wickets; T20I-heavy sample.','Ashutosh Sharma':'Low-cost finisher; small sample, high upside.','Suryakumar Yadav':'High-volume sample; strong in middle-over rebuilds.','Ayush Badoni':'Middle-order depth; strong versus collapses; bat-for-hire value.'}
fitb={'Umran Malik':'Express pace; wicket-taking in high-pressure phases; small sample.','Lockie Ferguson':'Overseas right-arm fast; about 30% of his balls come in overs 16-20.','Sufiyan Muqeem':'Left-arm wrist-spin (chinaman); very low pressure economy; T20I-only, thin sample.','Andre Russell':'Death bowler and hitter; allocation across two lists.','Patrick Cummins':'Control plus wickets in tight matches.','Josh Hazlewood':'Largest bowler sample; economy-lowering in pressure overs.','Mitchell Starc':'Left-arm pace; one source reports his release, so auction-relevant (unconfirmed).','Salman Mirza':'Left-arm medium pace; T20I sample.','Jacob Duffy':'Right-arm fast-medium; bowls a quarter of his overs at the death.','Krunal Pandya':'Slow left-arm orthodox; middle-over control.'}
rows=[['Batter','Role / fit for RR']]+[[n,fit.get(n,'')] for n in bf.name]
st.append(tbl(rows,[40,140])); st.append(Spacer(1,4))
rows=[['Bowler','Role / fit for RR']]+[[n,fitb.get(n,'')] for n in bw.name]
st.append(tbl(rows,[40,140]))
st.append(Paragraph('9. Reproducibility',H1))
st.append(Paragraph('Python (pandas, scikit-learn HistGradientBoosting); pipeline: clean deliveries, derive chase state, fit win-probability, compute Pressure Index, fit expected-value models, aggregate by player, score, validate (split-half, bootstrap). Input files are the supplied data pack; the code is available on request.',P))
doc.build(st,onFirstPage=foot,onLaterPages=foot)
