// Run from repo root: node scripts/seed-trivia-batch2.js
const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config({ path: './migrations/.env' });

const MONGO_URI = process.env.DATABASE_URL;
const DB_NAME = process.env.DATABASE_NAME || 'cinemacove';

const trivia = [
  {
    title: 'The Prop That Went AWOL',
    question: 'In Home Alone 2 (1992), which US president appears as a hotel guest thanks to a cameo deal?',
    choices: ['Bill Clinton', 'George H.W. Bush', 'Ronald Reagan', 'Donald Trump'],
    correctChoiceIndex: 3,
    explanation: 'Trump owned the Plaza Hotel at the time and demanded a cameo in exchange for letting the crew film there. He got 10 seconds of screen time and has never let anyone forget it.',
  },
  {
    title: 'The Sneeze That Launched a Career',
    question: 'In Singin\' in the Rain (1952), why did Donald O\'Connor have to redo "Make \'Em Laugh" from scratch?',
    choices: ["O'Connor kept laughing", 'The original take was accidentally erased', 'Kelly thought it was too funny', 'A lighting malfunction'],
    correctChoiceIndex: 1,
    explanation: "The entire routine was filmed on a single roll that was accidentally double-exposed. O'Connor had to redo it from scratch — and promptly checked himself into a hospital afterward from exhaustion.",
  },
  {
    title: 'The Unscripted Cry',
    question: 'In Toy Story 3 (2010), how did Pixar verify the furnace scene was sad enough before approving it?',
    choices: ['Watched it with their children', 'Made studio executives watch it', 'Played it at a funeral', 'Screened it without music to see if it still worked'],
    correctChoiceIndex: 3,
    explanation: "They deliberately cut the score during internal reviews. Crew members were reportedly crying even in silence. John Lasseter approved the scene by simply saying 'I can't talk right now.'",
  },
  {
    title: 'The Accidental Franchise',
    question: 'Bruce Willis deliberately made John McClane seem reluctant and scared in Die Hard (1988) because he was afraid of what?',
    choices: ['Being typecast as an action star', 'Being upstaged by Alan Rickman', 'Looking too old for stunts', 'The script being too violent'],
    correctChoiceIndex: 0,
    explanation: "Willis had just come off Moonlighting and was terrified of being typecast. Every groan, grunt, and whimper was intentional. He accidentally invented the relatable action hero and definitely got typecast anyway.",
  },
  {
    title: 'The Real Reason E.T. Looks Like That',
    question: "Steven Spielberg based E.T.'s face on a combination of which three inspirations?",
    choices: ['Einstein, a pug, and a baby', 'Carl Sandburg, Ernest Hemingway, and a cat', 'Albert Einstein, Carl Sandburg, and a pug', 'His mother, Gandhi, and a potato'],
    correctChoiceIndex: 2,
    explanation: "Designer Carlo Rambaldi blended the eyes of Einstein, the jowls of Sandburg, and pug anatomy. The result was described by Spielberg as 'someone you want to hug but who could also out-think you.'",
  },
  {
    title: 'The Most Expensive Coin Toss in Hollywood',
    question: "What happened to the prop coin Javier Bardem used in No Country for Old Men (2007)?",
    choices: ['It was lost on set', 'The Coens melted it down', 'Bardem kept it for good luck', 'It sold at auction for $3,000'],
    correctChoiceIndex: 2,
    explanation: "He considered it one of the most important props in the film and pocketed it. Given how terrifying that character is, nobody on set was brave enough to ask for it back.",
  },
  {
    title: 'Shakespeare in the Sewer',
    question: 'Mandy Patinkin said delivering his iconic line in The Princess Bride (1987) made him think of what personal event?',
    choices: ['A childhood bully', "His father's death", 'A failed audition', 'His divorce'],
    correctChoiceIndex: 1,
    explanation: "Patinkin's father died of cancer. He channeled that grief into every take. He's said in interviews that killing the six-fingered man was, for him, symbolically killing the cancer that took his dad.",
  },
  {
    title: 'The Hat Stays On',
    question: "In Raiders of the Lost Ark (1981), Harrison Ford's fedora blew off during a chase. What ended up in the final film?",
    choices: ["CGI'd it back on", 'Stopped filming and retrieved it', 'Ford caught it mid-take and kept going', 'They superglued it after that'],
    correctChoiceIndex: 2,
    explanation: "Ford instinctively snatched it out of the air without missing a beat. Spielberg loved it so much he kept the take. The hat had more job security than most of the supporting cast.",
  },
  {
    title: 'Accidental Oscar Bait',
    question: "Robin Williams improvised the entire park speech in Good Will Hunting (1997). What was Matt Damon's unscripted reaction?",
    choices: ['He broke character and laughed', 'He cried for real', 'He walked off set', 'He asked Williams to stop'],
    correctChoiceIndex: 0,
    explanation: "Damon's laugh at the end of that scene? Genuine. Unscripted. They kept it because it made Williams' performance feel even more real. The whole scene was one take.",
  },
  {
    title: 'The Dog That Saved the Day',
    question: 'In The Wizard of Oz (1939), Toto the cairn terrier earned $125/week. How did that compare to the Munchkin actors?',
    choices: ['The same as the Munchkins', 'More than the Munchkins', 'Half as much', 'Toto worked for treats only'],
    correctChoiceIndex: 1,
    explanation: "Toto earned $125/week. The 124 actors playing Munchkins got $50/week. Hollywood has always had its priorities straight.",
  },
  {
    title: 'The Ghost of Props Past',
    question: 'The pool skeletons in Poltergeist (1982) were allegedly what?',
    choices: ['Rubber props from a Halloween store', 'Real human skeletons from a medical supplier', 'Wax replicas made in Italy', 'CGI — groundbreaking for 1982'],
    correctChoiceIndex: 1,
    explanation: "Real skeletons were cheaper than fake ones at the time. JoBeth Williams only found out afterward. She's been openly horrified about it ever since, and the film's famous 'curse' suddenly made a lot more sense.",
  },
  {
    title: 'The Scene That Broke the Director',
    question: 'During the nightmarish production of Apocalypse Now (1979), what did Francis Ford Coppola threaten to do if the film wasn\'t working out?',
    choices: ['Sell the film to a TV network', 'Kill himself on camera', 'Fire the entire cast', 'Burn all the footage'],
    correctChoiceIndex: 1,
    explanation: "This was not a metaphor. The production was so chaotic — flooding, Brando's weight, Martin Sheen's heart attack, Coppola's breakdown — he told his crew he was genuinely considering it.",
  },
  {
    title: 'The Most Unintentional Comedy Scene',
    question: 'In Twilight (2008), Robert Pattinson\'s look of revulsion when he first smells Bella was directed how?',
    choices: ['He naturally looked nauseated', 'The food smell doubled his discomfort', 'He was method-acting being full', 'The director told him to look like he ate something bad'],
    correctChoiceIndex: 3,
    explanation: "Pattinson hated the character and had eaten a questionable burrito. Catherine Hardwicke told him to think of smelling something rotten. His genuine revulsion launched a thousand memes and a billion-dollar franchise.",
  },
  {
    title: 'The Improvised Genius',
    question: 'How many takes did it take to film Bill Murray\'s "Cinderella story" monologue in Caddyshack (1980)?',
    choices: ['45 minutes of repeated takes', 'One take', 'Three takes with a different ending each time', 'It was scripted but Murray "forgot" his lines'],
    correctChoiceIndex: 1,
    explanation: "Murray wandered onto set between his scheduled scenes, grabbed a gardening tool, and launched into it. The camera operator barely had time to react. Harold Ramis didn't call cut until Murray walked away.",
  },
  {
    title: 'The Worst-Timed Sneeze in Film History',
    question: 'The sound of the Millennium Falcon\'s malfunctioning hyperdrive in Star Wars (1977) was created using what?',
    choices: ['A broken washing machine', "A slowed-down sewing machine motor", 'George Lucas humming out of tune', 'A broken air conditioner'],
    correctChoiceIndex: 1,
    explanation: "Sound designer Ben Burtt recorded his mother's sewing machine mid-jam, slowed it to half speed, and layered it with grinding metal. Star Wars was built on broken household appliances and creative desperation.",
  },
  {
    title: 'The Least Professional Film Set Ever',
    question: 'During Animal House (1978), John Belushi would frequently show up to set having done what?',
    choices: ["Memorized everyone else's lines too", "Not slept since the previous day's shoot", 'Eaten the craft services table bare', 'Watched the dailies drunk'],
    correctChoiceIndex: 1,
    explanation: "Belushi treated sleep as optional and craft services as a threat. Director John Landis would sometimes write around scenes Belushi was too exhausted to do, which accidentally made the character more chaotic.",
  },
  {
    title: 'The Jacket That Wouldn\'t Die',
    question: "Olivia Newton-John was sewn into her black pants for Grease's (1978) final scene. What did that force her to do?",
    choices: ['Walk sideways', 'Jump instead of strut', 'Film all her shots from the waist up first', 'Take tiny shuffling steps instead of a full stride'],
    correctChoiceIndex: 3,
    explanation: "The pants were literally stitched onto her body. Every step she took at the carnival was a calculated shuffle. What looks like a seductive strut was actually survival.",
  },
  {
    title: 'The Mistake That Made History',
    question: 'A stormtrooper famously hits his head on a door in Star Wars: A New Hope. What did George Lucas do in the Special Edition?',
    choices: ['Digitally removed the scene', 'Added a sound effect to the bump', 'Replaced the trooper with CGI', 'Zoomed in on it as a joke'],
    correctChoiceIndex: 1,
    explanation: "Rather than cut it, Lucas leaned in and added a bonk sound for the 1997 Special Edition. The trooper was later revealed to be an ancestor of Jango Fett, making the clumsiness canonical.",
  },
  {
    title: 'The Casting That Almost Wasn\'t',
    question: 'Jeff Bridges was nearly passed over for The Big Lebowski (1998) because the Coens worried he was too what?',
    choices: ['Tall', 'Sober-looking', 'Recognizable', 'Good-looking'],
    correctChoiceIndex: 3,
    explanation: "The Dude needed to look like someone who hadn't made a good decision since 1987. Bridges showed up to his audition in dirty clothes and unwashed hair without being asked. The Coens cast him immediately.",
  },
  {
    title: 'The Most Method Wardrobe Choice',
    question: 'Tom Hanks gained 50 lbs for Cast Away (2000), then production shut down a year so he could lose it. What did he do that year?',
    choices: ["Made You've Got Mail", 'Made Road to Perdition', 'Did nothing — contractually required to rest', 'Made Saving Private Ryan'],
    correctChoiceIndex: 0,
    explanation: "Hanks went directly from the fat, pre-island Chuck to filming a romantic comedy with Meg Ryan. The crew of You've Got Mail reportedly had no idea what he'd just come from. He is built different.",
  },
  {
    title: 'The Line Reading That Changed Everything',
    question: 'Anthony Hopkins\' famous fava beans hiss in The Silence of the Lambs (1991) — where did it come from?',
    choices: ['Scripted with the hiss written in', 'Improvised by Hopkins in rehearsal and kept', 'Suggested by Jodie Foster', 'Added in post-production'],
    correctChoiceIndex: 1,
    explanation: "Hopkins did it once in rehearsal and director Jonathan Demme immediately said 'that's it, that's the take.' The hiss made Jodie Foster's disgusted recoil completely real. She did not have to act.",
  },
  {
    title: 'The Clumsiest Iconic Prop',
    question: 'The lightsaber sound in Star Wars was created by combining which two accidental sounds?',
    choices: ['A broken TV tube and a film projector hum', "A dentist's drill and a cat purring", 'A broken microwave and a fan motor', 'A hairdryer and fluorescent lighting buzz'],
    correctChoiceIndex: 0,
    explanation: "Ben Burtt was walking past a TV with a broken tube and noticed it interfered with a nearby projector. The hum created between them became the lightsaber idle tone. The most iconic sound in sci-fi was an accident in a hallway.",
  },
  {
    title: 'The Director Who Couldn\'t Stop',
    question: 'Stanley Kubrick made Shelley Duvall repeat a staircase scene in The Shining (1980) 127 times. What reason did he give her?',
    choices: ['To capture genuine exhaustion', 'To see how long she could hold the bat', 'To make Jack Nicholson laugh', "He never explained — he just kept saying 'again'"],
    correctChoiceIndex: 3,
    explanation: "Duvall had a breakdown during production. Her hair was falling out from stress. Kubrick reportedly considered her real psychological deterioration ideal for the role, which is either genius filmmaking or a cry for a therapist.",
  },
  {
    title: 'The Cameo Nobody Asked For',
    question: 'Alfred Hitchcock appeared in Lifeboat (1944), which was set entirely on a boat. How did he pull off his cameo?',
    choices: ['He appeared as a corpse floating past', 'As a newspaper ad visible in the lifeboat', 'His voice was heard off-screen', 'He was a reflection in the water'],
    correctChoiceIndex: 1,
    explanation: "Hitchcock appeared in a before-and-after weight loss advertisement in a newspaper one of the survivors was reading. He had recently lost weight and used the cameo to show it off. He was his own publicist.",
  },
  {
    title: 'The Sneeze That Ruined Everything',
    question: 'In Jurassic Park (1993), what did the baby triceratops animatronic unexpectedly do to Laura Dern?',
    choices: ['Sneezed fake mucus on her', 'Bit a crew member', 'Fell over', 'Made a noise that terrified the child actors'],
    correctChoiceIndex: 0,
    explanation: "The animatronic's pneumatic system misfired and blasted Dern with a full load of simulated snot. Her reaction — laughing while disgusted — is completely genuine. She was not warned.",
  },
  {
    title: 'The Injury That Started a Franchise',
    question: 'Young Mel Gibson was initially rejected at his Mad Max (1979) audition. How did he get a callback?',
    choices: ['He showed up again uninvited', 'His friend got in a fight and Gibson came to help, looking battered', 'He sent a self-made demo reel', "The director's assistant recognized him from a commercial"],
    correctChoiceIndex: 1,
    explanation: "Gibson showed up to a friend's audition to drive him home, got caught in a brawl, and returned days later with a bruised face. The director said 'come back in three weeks, don't let anyone fix that.' He got the part.",
  },
  {
    title: 'The Deleted Scene That Defined a Character',
    question: 'John Hughes filmed an alternate ending for Ferris Bueller\'s Day Off (1986) where Ferris was revealed to be what?',
    choices: ["Cameron's imaginary friend", 'Terminally ill', 'A girl the whole time', 'His own twin brother'],
    correctChoiceIndex: 0,
    explanation: "Hughes shot the ending but felt it undermined the film's entire spirit. The test audience was furious. He buried it. He later denied it ever existed, which made everyone more convinced it did.",
  },
  {
    title: 'The Method Actor Who Went Too Far',
    question: 'For The Machinist (2004), Christian Bale lost 63 pounds on a daily diet of what?',
    choices: ['One apple and a can of tuna', 'Coffee and cigarettes only', 'A single hard-boiled egg per day', 'Nothing but water and vitamins'],
    correctChoiceIndex: 0,
    explanation: "Bale wanted to go further but the producers intervened. He then immediately bulked up for Batman Begins, which started filming shortly after. His nutritionist reportedly needed their own therapist.",
  },
];

async function main() {
  const client = new MongoClient(MONGO_URI);
  await client.connect();
  const db = client.db(DB_NAME);
  const collection = db.collection('dailycontents');

  // Start the day after the existing 6 seeded trivia (March 9–14), so March 15
  const startDate = new Date('2026-03-15T00:00:00.000Z');

  const docs = trivia.map((t, i) => {
    const publishAt = new Date(startDate);
    publishAt.setUTCDate(startDate.getUTCDate() + i);
    return {
      _id: new ObjectId(),
      type: 'trivia',
      title: t.title,
      question: t.question,
      choices: t.choices,
      correctChoiceIndex: t.correctChoiceIndex,
      explanation: t.explanation,
      publishAt,
      createdBy: 'seed',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  });

  const result = await collection.insertMany(docs);
  console.log(`Inserted ${result.insertedCount} trivia documents.`);
  console.log('Date range:', docs[0].publishAt.toISOString(), '→', docs[docs.length - 1].publishAt.toISOString());
  await client.close();
}

main().catch((err) => { console.error(err); process.exit(1); });
