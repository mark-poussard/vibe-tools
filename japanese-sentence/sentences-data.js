import { buildCorpusMetadata } from './utils.js';
/* DATA_START */
export const seedSentencesMap = {
  "1": {
    "english": "I didn't miss a single class this year.",
    "primaryJapanese": "今年は一度も授業を欠席しませんでした。",
    "alternates": [
      "今年は一度も授業を欠席しなかった"
    ]
  },
  "2": {
    "english": "I was glad that she changed her mind.",
    "primaryJapanese": "彼女が考えを変えてくれて嬉しかった。",
    "alternates": []
  },
  "3": {
    "english": "She covered her ears with both hands so she couldn't hear the noise.",
    "primaryJapanese": "彼女は騒音がきこえないように、両手で耳を塞いだ。",
    "alternates": [
      "彼女は騒音が聞こえないように両手で耳を塞いだ"
    ]
  },
  "4": {
    "english": "The broken window was boarded up.",
    "primaryJapanese": "壊れた窓は板で塞がれた。",
    "alternates": []
  },
  "5": {
    "english": "I feel like my Japanese proficiency has improved over this past year.",
    "primaryJapanese": "この一年で日本語の力が増したように思う。",
    "alternates": []
  },
  "6": {
    "english": "My younger brother always sleeps with a stuffed bear.",
    "primaryJapanese": "弟はいつもぬいぐるみの熊と寝る。",
    "alternates": []
  },
  "7": {
    "english": "I want you to make a clear plan before you go out.",
    "primaryJapanese": "出かける前に明確な計画を立てておいてほしい。",
    "alternates": []
  },
  "8": {
    "english": "May I see your driver's license?",
    "primaryJapanese": "免許証を拝見できますか。",
    "alternates": []
  },
  "9": {
    "english": "He transferred from the bus to the subway.",
    "primaryJapanese": "彼はバスから地下鉄に乗り換えました。",
    "alternates": [
      "彼はバスから地下鉄に乗り換えた"
    ]
  },
  "10": {
    "english": "That is nothing but your imagination.",
    "primaryJapanese": "それは君の想像にすぎない。",
    "alternates": []
  },
  "11": {
    "english": "If you were in my position, you would do the same thing.",
    "primaryJapanese": "あなたが私の立場なら同じことをするだろう。",
    "alternates": [
      "あなたは私の立場だったら同じことをするだろう"
    ]
  },
  "12": {
    "english": "What would you do if you were in my position?",
    "primaryJapanese": "もしあなたが私の立場だったらどうしますか。",
    "alternates": []
  },
  "13": {
    "english": "Many people are opposed to animal testing.",
    "primaryJapanese": "多くの人が動物の実験に反対している。",
    "alternates": []
  },
  "14": {
    "english": "Actually, I have known the truth for a long time.",
    "primaryJapanese": "実はずっと前から本当のことは知っていたんだ。",
    "alternates": []
  },
  "15": {
    "english": "There is no chance of her succeeding.",
    "primaryJapanese": "彼女が成功する可能性はない。",
    "alternates": []
  },
  "16": {
    "english": "We discussed the possibility of marriage.",
    "primaryJapanese": "結婚の可能性について話し合った。",
    "alternates": []
  },
  "17": {
    "english": "Please answer the question clearly.",
    "primaryJapanese": "質問に明確に答えてください。",
    "alternates": []
  },
  "18": {
    "english": "What is this paper used for?",
    "primaryJapanese": "この紙は何に使うのですか。",
    "alternates": []
  },
  "19": {
    "english": "He did not attend the meeting due to illness.",
    "primaryJapanese": "彼は病気を理由にその会議を出席しなかった。",
    "alternates": [
      "彼は病気を理由に会議を出席しなかった",
      "彼は病気を理由に会議を出席しませんでした"
    ]
  },
  "20": {
    "english": "I can't find the words to properly convey this deep sorrow.",
    "primaryJapanese": "この深い悲しみをうまく伝える言葉が見つからない。",
    "alternates": []
  },
  "21": {
    "english": "I can't find the invisible car.",
    "primaryJapanese": "見えない車が見つからない。",
    "alternates": []
  },
  "22": {
    "english": "Whatever he does is none of my business.",
    "primaryJapanese": "彼が何をしようと私の知ったことではない。",
    "alternates": []
  },
  "23": {
    "english": "I learned about the accident on the 5 o'clock news.",
    "primaryJapanese": "5時のニューズでその事故を知った。",
    "alternates": [
      "五時のニューズでその事故を知った",
      "五時のニューズでその事故を知りました"
    ]
  },
  "24": {
    "english": "The weather is nice, so Mount Fuji can be seen clearly.",
    "primaryJapanese": "天気がいいので、富士山がはっきり見える。",
    "alternates": []
  },
  "25": {
    "english": "This picture is really well drawn.",
    "primaryJapanese": "この絵は実によく描けている。",
    "alternates": []
  },
  "26": {
    "english": "I hear the king is going to build a statue of us in the square.",
    "primaryJapanese": "王様が広場に僕たちの彫像を作ってくれるそうだ。",
    "alternates": [
      "王様が広場に僕達の彫像を作ってくれるそうだ"
    ]
  },
  "27": {
    "english": "With this, a peaceful era will come to the world.",
    "primaryJapanese": "これで世界に平和な時代が訪れよう。",
    "alternates": []
  },
  "28": {
    "english": "Your life ahead will probably become longer than we can even imagine.",
    "primaryJapanese": "君の先の人生は僕達には想像も長いものにできないほどなるんだろうね。",
    "alternates": []
  },
  "29": {
    "english": "I have to look for a job when I get back.",
    "primaryJapanese": "帰ったら仕事を探さないとな。",
    "alternates": []
  },
  "30": {
    "english": "I greeted the groom's older sister.",
    "primaryJapanese": "新郎のお姉さんに挨拶しました。",
    "alternates": [
      "新郎の姉さんに挨拶しました"
    ]
  },
  "31": {
    "english": "Let's talk it over before we fight.",
    "primaryJapanese": "喧嘩する前に話し合おう。",
    "alternates": []
  },
  "32": {
    "english": "He was clearly confused.",
    "primaryJapanese": "彼は明らかに困惑していた。",
    "alternates": []
  },
  "33": {
    "english": "She is busy every day preparing for the wedding.",
    "primaryJapanese": "彼女は結婚式の準備で毎日忙しい。",
    "alternates": []
  },
  "34": {
    "english": "She decided on the red jacket.",
    "primaryJapanese": "彼女は赤い上着に決めた。",
    "alternates": []
  },
  "35": {
    "english": "Have you decided on a roommate?",
    "primaryJapanese": "ルームメイトは決まりましたか？",
    "alternates": []
  },
  "36": {
    "english": "I decided to go there.",
    "primaryJapanese": "そこに行くことに決めた。",
    "alternates": []
  },
  "37": {
    "english": "It hasn't been decided who will go there.",
    "primaryJapanese": "誰がそこへ行くかは決まっていません。",
    "alternates": [
      "誰がそこに行くかは決まっていません"
    ]
  },
  "38": {
    "english": "Have you decided on your order?",
    "primaryJapanese": "ご注文はお決まりですか？",
    "alternates": []
  },
  "39": {
    "english": "He is Jewish.",
    "primaryJapanese": "彼はユダヤ教徒です。",
    "alternates": []
  },
  "40": {
    "english": "Christianity is an older religion than Islam.",
    "primaryJapanese": "イスラム教よりクレスト教のほうは古い宗教です。",
    "alternates": [
      "イスラム教よりクリスト教の方は古い宗教です",
      "イスラム教よりクリスト教は古い宗教です"
    ]
  },
  "41": {
    "english": "This is an old Hindu temple.",
    "primaryJapanese": "これは古いヒンドゥー教の寺院です。",
    "alternates": []
  },
  "42": {
    "english": "I checked in at the airport.",
    "primaryJapanese": "空港で搭乗手続きをした。",
    "alternates": []
  },
  "43": {
    "english": "Please don't block the way.",
    "primaryJapanese": "道を塞がないでください。",
    "alternates": []
  },
  "44": {
    "english": "His music is immortal.",
    "primaryJapanese": "彼の音楽は不滅だ。",
    "alternates": []
  },
  "45": {
    "english": "The human soul is immortal.",
    "primaryJapanese": "人間の魂は不滅だ。",
    "alternates": []
  },
  "46": {
    "english": "That monk does not eat meat.",
    "primaryJapanese": "そのお坊さんは肉を食べません。",
    "alternates": [
      "その坊さんは肉を食べない"
    ]
  },
  "47": {
    "english": "Stairway to Heaven",
    "primaryJapanese": "天国への階段",
    "alternates": []
  },
  "48": {
    "english": "The strong sunlight dried the ground.",
    "primaryJapanese": "強い日差しで地面が乾いた。",
    "alternates": []
  },
  "49": {
    "english": "The paint is not dry yet.",
    "primaryJapanese": "ペンキはまだ乾いていない。",
    "alternates": []
  },
  "50": {
    "english": "He dried his wet clothes by holding them over the fire.",
    "primaryJapanese": "彼は濡れた服を火にあぶって乾かした。",
    "alternates": []
  },
  "51": {
    "english": "She is busy every day preparing for the wedding.",
    "primaryJapanese": "彼女は結婚式の準備で毎日忙しい。",
    "alternates": [
      "彼女は結婚の準備で毎日忙しい"
    ]
  },
  "52": {
    "english": "They are Hindus.",
    "primaryJapanese": "彼女たちはヒンドゥー教徒です。",
    "alternates": [
      "彼らはヒンドゥー教徒です"
    ]
  },
  "53": {
    "english": "Many relatives will come to my older sister's wedding.",
    "primaryJapanese": "姉の結婚式に親戚がたくさん来ます。",
    "alternates": [
      "多くの親戚は姉の結婚式に来る",
      "お姉さんの結婚式に親戚がたくさん来ます"
    ]
  },
  "54": {
    "english": "She was not aware of my existence.",
    "primaryJapanese": "彼女は私の存在には気づいていなかった。",
    "alternates": []
  },
  "55": {
    "english": "Do you think God exists?",
    "primaryJapanese": "神は存在すると思いますか。",
    "alternates": []
  },
  "56": {
    "english": "Do you believe in the existence of UFOs?",
    "primaryJapanese": "ＵＦＯの存在を信じていますか。",
    "alternates": [
      "UFOの存在は信じているか",
      "ＵＦＯの存在は信じていますか"
    ]
  },
  "57": {
    "english": "Many people attended his funeral.",
    "primaryJapanese": "彼の葬式には大勢の人が参列した。",
    "alternates": [
      "彼の葬式には大勢の人が参列しました"
    ]
  },
  "58": {
    "english": "This is the church where Blake is buried.",
    "primaryJapanese": "これがブレークの葬られている教会です。",
    "alternates": [
      "これはブレークが葬られている教会です",
      "これはブレークの葬られている教会です"
    ]
  },
  "59": {
    "english": "He can hear the voices of the gods.",
    "primaryJapanese": "彼は神々の声が聞こえる。",
    "alternates": []
  },
  "60": {
    "english": "Do you believe in Shinto?",
    "primaryJapanese": "神道を信仰しますか？",
    "alternates": []
  },
  "61": {
    "english": "Is Buddhism a religion?",
    "primaryJapanese": "仏教は宗教ですか。",
    "alternates": []
  },
  "62": {
    "english": "This is a Buddhist temple.",
    "primaryJapanese": "ここは仏教の寺です。",
    "alternates": [
      "これは仏教の寺です"
    ]
  },
  "63": {
    "english": "This house needs to be painted.",
    "primaryJapanese": "この家はペンキを塗る必要がある。",
    "alternates": []
  },
  "64": {
    "english": "When did you have the walls painted?",
    "primaryJapanese": "あなたはいつ壁を塗ってもらったのですか。",
    "alternates": [
      "いつ壁を塗ってもらったのですか"
    ]
  },
  "65": {
    "english": "If it were me, I would paint it blue.",
    "primaryJapanese": "私なら、青く塗るだろうね。",
    "alternates": []
  },
  "66": {
    "english": "I painted the roof light blue.",
    "primaryJapanese": "私は屋根をライトブルーに塗った。",
    "alternates": [
      "屋根をライトブルーに塗った"
    ]
  },
  "67": {
    "english": "Trains pass this railroad crossing often, so please be careful when crossing.",
    "primaryJapanese": "この踏切はよく電車が通るので、通る時に注意してください。",
    "alternates": []
  },
  "68": {
    "english": "There is a railroad crossing near the station where there are always a lot of people.",
    "primaryJapanese": "駅の近くに、いつも人がたくさんいる踏切があります。",
    "alternates": [
      "駅の近くにいつも人がたくさんいる踏切がある"
    ]
  },
  "69": {
    "english": "Someone stepped on my toes on the crowded bus.",
    "primaryJapanese": "混雑したバスの中で私は誰かに爪先を踏まれた。",
    "alternates": [
      "混雑バスの中で私は誰かにつま先を踏まれた"
    ]
  },
  "70": {
    "english": "Heavy pillars are needed to support this bridge.",
    "primaryJapanese": "この橋を支えるには重い柱が必要だ。",
    "alternates": [
      "この橋を支えるのに重い柱が必要だ"
    ]
  },
  "71": {
    "english": "The cat was sharpening its claws on the pillar.",
    "primaryJapanese": "猫が柱で爪を研いでいた。",
    "alternates": [
      "猫は柱で爪を研いでいた"
    ]
  },
  "72": {
    "english": "He was sharpening a knife.",
    "primaryJapanese": "彼はナイフを研いでいました。",
    "alternates": [
      "彼はナイフを研いでいた"
    ]
  },
  "73": {
    "english": "She is always sharpening her blade against others.",
    "primaryJapanese": "彼女はいつも人に対して刃を研いでいます。",
    "alternates": [
      "彼女はいつも人に対して刃を研いでいる"
    ]
  },
  "74": {
    "english": "The date and time were specified, but the location was not.",
    "primaryJapanese": "日時は指定されたが、場所は指定されていない。",
    "alternates": []
  },
  "75": {
    "english": "He specified three books for me to read.",
    "primaryJapanese": "彼は私に読むべき本を３冊指定した。",
    "alternates": [
      "彼は私に読むべき本を三冊指定した"
    ]
  },
  "76": {
    "english": "Could you please specify another day?",
    "primaryJapanese": "別の日をご指定いただけませんか。",
    "alternates": []
  },
  "77": {
    "english": "Please scan your fingerprint here.",
    "primaryJapanese": "こちらに指紋をスキャンしてください。",
    "alternates": []
  },
  "78": {
    "english": "Where are you staying?",
    "primaryJapanese": "滞在先はどちらですか？",
    "alternates": []
  },
  "79": {
    "english": "How many days will you stay?",
    "primaryJapanese": "何日間滞在しますか？",
    "alternates": []
  },
  "80": {
    "english": "Humans are destined to die.",
    "primaryJapanese": "人間は死ぬべき運命にある。",
    "alternates": []
  },
  "81": {
    "english": "Patience is essential for a teacher.",
    "primaryJapanese": "教師にとって忍耐力は不可欠だ。",
    "alternates": [
      "教師にとって忍耐力が不可欠だ"
    ]
  },
  "82": {
    "english": "There are various hardships to endure in life.",
    "primaryJapanese": "人生にはいろいろ耐えるべき苦労がある。",
    "alternates": []
  },
  "83": {
    "english": "He had a hard time getting his ideas understood at the meeting.",
    "primaryJapanese": "彼は会議で自分の考えをわかってもらうのに苦労した。",
    "alternates": []
  },
  "84": {
    "english": "I had a hard time catching a taxi.",
    "primaryJapanese": "タクシーを拾うのに苦労した。",
    "alternates": []
  },
  "85": {
    "english": "Please cancel the reservation.",
    "primaryJapanese": "予約を取り消してください。",
    "alternates": []
  },
  "86": {
    "english": "He canceled the appointment at the very last minute.",
    "primaryJapanese": "彼は最後の最後になって約束を取り消した。",
    "alternates": []
  },
  "87": {
    "english": "In the past, smoke signals were raised at the top of the mountain to warn of enemy attacks.",
    "primaryJapanese": "昔、敵の襲来を知らせるために、山頂で狼煙を上げた。",
    "alternates": []
  },
  "88": {
    "english": "When I recover from my illness, I want to wear my new shoes and go out to play.",
    "primaryJapanese": "病気が回復したら、新しい靴を履いて遊びに行きたいです。",
    "alternates": [
      "病気を治ったら新しい靴を履いて外に出かけ遊びたい",
      "病気が回復したら新しい靴を履いて遊びに行きたい"
    ]
  },
  "89": {
    "english": "There is almost no hope of his recovery.",
    "primaryJapanese": "彼が回復する見込みはほとんどない。",
    "alternates": []
  },
  "90": {
    "english": "Recovery was almost impossible.",
    "primaryJapanese": "回復はほとんど不可能だった。",
    "alternates": []
  },
  "91": {
    "english": "A fat white cat was sitting on the fence, looking at the two of them with sleepy eyes.",
    "primaryJapanese": "太った白い猫が塀に座って、眠そうな目で二人を見ていました。",
    "alternates": []
  },
  "92": {
    "english": "He climbed over the fence.",
    "primaryJapanese": "彼は塀を乗り越えた。",
    "alternates": []
  },
  "93": {
    "english": "She treated each of us to ice cream.",
    "primaryJapanese": "彼女は私たち一人一人にアイスクリームをおごってくれた。",
    "alternates": []
  },
  "94": {
    "english": "If you help me, I'll treat you to dinner.",
    "primaryJapanese": "手伝ってくれれば、晩ご飯を君におごるよ。",
    "alternates": []
  },
  "95": {
    "english": "I'll treat you.",
    "primaryJapanese": "君におごってやるよ。",
    "alternates": []
  },
  "96": {
    "english": "I bought him a drink as a thank you for his help.",
    "primaryJapanese": "手伝いのお礼として私は彼に一杯おごった。",
    "alternates": []
  },
  "97": {
    "english": "As a mixed-race child, he had a hard time overcoming cultural barriers.",
    "primaryJapanese": "彼は混血児として、文化の壁を乗り越える苦労があった。",
    "alternates": []
  },
  "98": {
    "english": "I had my wallet stolen by the man sitting next to me.",
    "primaryJapanese": "私は隣に座っていた男に財布を奪われた。",
    "alternates": []
  },
  "99": {
    "english": "Please light the candle.",
    "primaryJapanese": "ろうそくに火をつけてください。",
    "alternates": []
  },
  "100": {
    "english": "My mother put 13 candles on my birthday cake.",
    "primaryJapanese": "母は私の誕生日のケーキにろうそくを１３本立てた。",
    "alternates": [
      "母は私の誕生日のケーキにろうそくを十三本立てた"
    ]
  },
  "101": {
    "english": "The candle went out by itself.",
    "primaryJapanese": "ろうそくがひとりでに消えた。",
    "alternates": []
  },
  "102": {
    "english": "A tree is known by its fruit.",
    "primaryJapanese": "木は果実を見ればわかる。",
    "alternates": []
  },
  "103": {
    "english": "Every time I see this picture, I remember the past.",
    "primaryJapanese": "この絵を見るたびに、昔を思い出します。",
    "alternates": []
  },
  "104": {
    "english": "You must submit your residence card every time you renew its validity period.",
    "primaryJapanese": "在留カードは有効期限の更新のたびに提出する必要があります。",
    "alternates": []
  },
  "105": {
    "english": "These answers mistake cause for effect.",
    "primaryJapanese": "これらの回答は、原因と結果を履き違えている。",
    "alternates": []
  },
  "106": {
    "english": "That is a problem we cannot answer at all.",
    "primaryJapanese": "それは我々がまったく回答できない問題だ。",
    "alternates": []
  },
  "107": {
    "english": "We need an answer by Friday.",
    "primaryJapanese": "金曜日までに回答が必要です。",
    "alternates": []
  },
  "108": {
    "english": "He has lost a considerable amount of weight compared to last year.",
    "primaryJapanese": "彼は去年より相当痩せている。",
    "alternates": []
  },
  "1772956314689": {
    "english": "The residents take a walk in the neighborhood.",
    "primaryJapanese": "住民たちは近所を散歩する。",
    "alternates": [
      "住民たちは近所を散歩します"
    ]
  },
  "1772956363069": {
    "english": "I am very happy that my grandmother recovered from her illness.",
    "primaryJapanese": "大変嬉しいことに祖母の病気が治った。",
    "alternates": []
  },
  "1774078091187": {
    "english": "He sided with the opposition group in the argument.",
    "primaryJapanese": "彼はその討論で反対派に付いた。",
    "alternates": []
  },
  "1774078164380": {
    "english": "It is said that smoking is bad for your health.",
    "primaryJapanese": "喫煙は健康に悪いと言われています。",
    "alternates": [
      "喫煙は健康に悪いと言われている"
    ]
  },
  "1774078203134": {
    "english": "Health is indispensable to a happy life.",
    "primaryJapanese": "幸福には健康が不可欠です。",
    "alternates": [
      "幸福には健康が不可欠だ"
    ]
  },
  "1774078295658": {
    "english": "The mountain path was under a blanket of leaves, soft and easy to walk on.",
    "primaryJapanese": "登山道は一面の落ち葉で柔らかく歩きやすかった。",
    "alternates": []
  },
  "1774078305409": {
    "english": "The wind gently kissed the trees.",
    "primaryJapanese": "風が柔らかく木立に触れた。",
    "alternates": []
  },
  "1774078387787": {
    "english": "This cloth feels soft.",
    "primaryJapanese": "この布は手触りが柔らかい。",
    "alternates": [
      "この布は手触りが柔らかいです"
    ]
  },
  "1774078410868": {
    "english": "My grandmother can only eat soft food.",
    "primaryJapanese": "祖母はやわらかい物しか食べられない。",
    "alternates": [
      "祖母は柔らかい物しか食べられない"
    ]
  },
  "1774078434231": {
    "english": "A baby has delicate skin.",
    "primaryJapanese": "赤ん坊は柔らかい肌をしている。",
    "alternates": []
  },
  "1774080657622": {
    "english": "My mother is against smoking.",
    "primaryJapanese": "母は喫煙に反対だ。",
    "alternates": []
  },
  "1774103354335": {
    "english": "They will debate the question tomorrow.",
    "primaryJapanese": "彼らは明日その問題について討論する。",
    "alternates": []
  },
  "1774387776025": {
    "english": "These poor people were at the mercy of the cruel dictator.",
    "primaryJapanese": "これらの気の毒な人々は非情な独裁者のなすがままになっていた。",
    "alternates": []
  },
  "1775415095206": {
    "english": "My hands got dirty from the oil while fixing the bike.",
    "primaryJapanese": "自転車の修理で手が油で汚れた。",
    "alternates": []
  },
  "1775415138888": {
    "english": "A mud-covered dog jumped on me, and my favorite dress was dirtied.",
    "primaryJapanese": "泥だらけの犬に飛びつかれ、お気に入りのドレスを汚されてしまった",
    "alternates": []
  },
  "1775415165667": {
    "english": "The wall is covered with graffiti.",
    "primaryJapanese": "壁は落書きだらけだ。",
    "alternates": []
  },
  "1775415177431": {
    "english": "Two high school boys beat Tom black and blue.",
    "primaryJapanese": "トムは二人の高校生にあざだらけになるまで殴られた。",
    "alternates": []
  },
  "1775415208499": {
    "english": "He feels that his hands are stained with blood (guilt).",
    "primaryJapanese": "彼は自分の手が血で汚れていると感じている",
    "alternates": []
  }
};
export const seedCorpusMetadata = {
  "version": "fnv1a-12a76bd4",
  "sentenceCount": 126
};
/* DATA_END */

