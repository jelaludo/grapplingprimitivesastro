---
title: "Hunting Insights"
subtitle: "閃きの狩人"
date: "2024/01/05"
---

Let's say you get a 1% chance of getting a new insight for each training session you do. Here are the chances that you'll get an insight in a year by training 1,2,3,4 or 5x a week.

{1: 0.53, 2: 1.05, 3: 1.5, 4: 2.09, 5: 2.6}  
{1: 0.52, 2: 1.02, 3: 1.57, 4: 2.08, 5: 2.57}

The above is a quick and dirty Monte Carlo simulation, running our hyper-simplified model 10,000 times.

What's an insight in Jiu Jitsu? anything that make a click.  
_"so to break *any joint you need to control the joint above... makes sense..."  
"oooh you can choose where you direct your weight into your partner!"  
"wait!? the way you apply pressure on the shoulder with one leg in a shoulder-triangle-armbar when they escape, is actually the exact same movement as when doing a dogbar!"_  
etc.

These can't really be taught.  
You can share what you learned, you can guide, but it's trite and true that the learner needs to rediscover that insight by himself for it to make sense.

There's no way to make this model accurate, there are simply too many variables, but directionally, I'd say that the odds of getting a new insights about Jiu Jitsu go up the more insights you already have, at least in the early stages.  
  
so let's tweak it so that have a insight increases the chance of getting more. now we get.

Average Insights per Year for Different Training Frequencies:  
1: 0.64  
2: 1.42  
3: 2.33  
4: 3.28  
5: 4.26  
A practioner only training 1x a week and just going through the motions of what's being taught, without really exploring by himself, might take 2 years before having a "a-ah!" moment. Someone training 5x a week might have over 4 such insights. That's one of the reasons why over a couple of years you can have such wide discrepancy of skills between people who've trained roughly the same amount of time, but at different paces.  
  
_"you can't be spoon fed BJJ and get good, you need to have you own insights and lightbult moments" [...]_

_"so you need to multiply the chances to have a lightbulb moment"_

_"Create the opportunity for the magic to fucking happen"_  
Paraphrasing Garry Tonon on a BJJ Fanatics podcast 2023.12.25

A teacher can never really teach a student anything, the best they can do is create a good learning environment

```
<pre><code>
#I dropped this code into Replit to calculate the above
import random

def monte_carlo_simulation_enhanced(sessions_per_week_options, weeks, base_chance, enhanced_chance, num_simulations):
    cumulative_insights = {sessions: [] for sessions in sessions_per_week_options}

    for sessions_per_week in sessions_per_week_options:
        for _ in range(num_simulations):
            total_insights = 0
            chance = base_chance
            insight_gained = False

            for _ in range(weeks * sessions_per_week):
                if random.random() < chance:
                    total_insights += 1
                    insight_gained = True

                if insight_gained:
                    chance = enhanced_chance  # Increase chance only after first insight

            cumulative_insights[sessions_per_week].append(total_insights)

    return cumulative_insights

# Parameters
weeks_in_a_year = 52
base_chance_per_session = 0.01  # Initial 1% chance per session
enhanced_chance_per_session = 0.02  # Increased chance after first insight
sessions_per_week_options = [1, 2, 3, 4, 5]  # Number of sessions per week
num_simulations = 10000

# Running the enhanced Monte Carlo simulation
results = monte_carlo_simulation_enhanced(sessions_per_week_options, weeks_in_a_year, base_chance_per_session, enhanced_chance_per_session, num_simulations)

# Calculating and outputting average insights
print("Average Insights per Year for Different Training Frequencies:")
for sessions, insights in results.items():
    average_insights = sum(insights) / len(insights)
    print(f"{sessions}: {average_insights:.2f}")
</code></pre>
```

練習を行うごとに1％の確率で新しい洞察を得られるとしましょう。こちらは、週に1、2、3、4、5回のトレーニングをすることで1年間に洞察を得る確率です。

{1回: 0.53, 2回: 1.05, 3回: 1.5, 4回: 2.09, 5回: 2.6} {1回: 0.52, 2回: 1.02, 3回: 1.57, 4回: 2.08, 5回: 2.57}

これは、簡易的なモンテカルロシミュレーションで、非常に単純化されたモデルを10,000回実行したものです。

柔術における「洞察」とは何でしょうか？ それは「閃き」と感じる何かです。 「ある関節を折るには、その上の関節をコントロールする必要があるんだ…なるほどね」 「おお、練習相手に自分の重さをピンポイントに差し付けるね！」 「えっ、腕十字で相手が逃げる時に片足で肩に圧力をかける肩三角の動きって、ドッグバーをする時と全く同じ動きなの！？」 などです。

これらは実際に教えることはできません。 自分が学んだことを共有したり、導いたりすることはできますが、学ぶ人が自分でその洞察を再発見しないと意味がわからないというのが実情です。

このモデルを正確にすることは不可能です。変数が多すぎますが、方向性としては、少なくとも初期段階では、柔術に関する新しい洞察を持っているほど、さらに新しい洞察を得る可能性が高まると言えるでしょう。

では、一度洞察を得るとさらに洞察を得やすくなるようにモデルを調整してみましょう。そうすると、以下のような結果が得られます。

年間の平均洞察数（トレーニング頻度別）： 1回: 0.64 2回: 1.42 3回: 2.33 4回: 3.28 5回: 4.26

週に1回だけトレーニングし、教えられた通りに動くだけで、自分で探求しない人は、「おーっ！」という瞬間にたどり着くまでに2年かかるかもしれません。週に5回トレーニングする人は、そのような洞察を4回以上持つかもしれません。これが、数年間トレーニングを続けていても、ペースが異なるためにスキルに大きな差が生じる理由の一つです。

「柔術を一個一個砕いて伝わっても上手くなることはできない。自分自身で洞察の瞬間を得る必要がある」

「だから、閃くチャンスを増やす必要がある」

「魔法が起こる機会を作り出すんだ」

ギャリー・トノンが2023年12月25日のBJJ Fanaticsポッドキャスト

「先生は本当の意味で生徒に何かを教えることはできない、できるのは良い学習環境を作ることだけだ」

誰かの名言、納得。

2024/01/05
