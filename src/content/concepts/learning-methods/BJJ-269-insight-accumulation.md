---
id: "BJJ-269"
concept: "Insight Accumulation"
category: "Learning Methods"
axis_self_opponent: 0.9
axis_mental_physical: 0.95
color: "#9370DB"
short_description: "Training frequency multiplies the probability of breakthroughs. Each insight makes the next one more likely, creating a compounding skill gap over time."
tags: []
related:
  - "BJJ-265-explore-vs-exploit"
  - "BJJ-088-sponge"
  - "BJJ-033-real-time-learning"
  - "BJJ-145-1-21-persistence"
  - "BJJ-073-32-32-grandmaster"
  - "BJJ-116-keep-learning"
  - "BJJ-167-show-up-consistently"
---

Insights, those moments where two unrelated techniques or concepts suddenly click into a connected system, cannot really be directly taught. They have to be self-discovered. But you can dramatically increase the odds.

A Monte Carlo simulation could easily show that if training1x/week gives you roughly 1 insight per year (entirely made up number). Training 5x/week might give you 10 insights, not 5. And each insight you have makes the next one more likely, because you have a richer network of connections for new patterns to attach to.

This is why consistent practitioners pull away from sporadic ones even when talent is equal.  ("*Discipline eats talent for breakfast*", or something like that).   It's not **just** more reps. It's more *lottery tickets* for the moments that actually transform your game. The purple belt who trains four days a week isn't just four times better than the one who trains once. They're probably operating on a different curve entirely.

The actionable takeaway: you are not just building reps when you train. You are creating opportunities for the magic to happen. Train with curiosity, not just intensity, and train often. Frequency is the multiplier that makes everything else compound.

I can't remember for the life of where I heard this... Maybe Garry Tonon on a podcast again.

maybe we need a : 
**Training-to-insights ratio** 
> _The proportion of mat time that produces new insights._
low? just going through the motions, trying to win rounds with the same old shit.
high? exploring, embracing variance. DILIGAF I'm learning!

insight requires variance.
epistemic efficiency of practice ?

ask your favorite AI Coding model to build you something like this :
Model:

- Baseline: 1 insight/year at 1 session/week (52 sessions), p_base = 1/52 per session
- At N sessions/week: N*52 sessions/year
- Connection multiplier α: after each insight gained, p_insight for next session = p_base * (1 + α * insights_so_far)
- Run 2000 Monte Carlo trials
- Show: histogram of year-end insights, with mean/median/IQR stats, compared to baseline of 1

---
Category: [[Learning Methods]]
