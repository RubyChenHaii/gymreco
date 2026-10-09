// ⚠️ 本檔由 scripts/export-initial-data.js 依備份 JSON（backup.json）轉換產生

export const INIT_LIBRARY = [
  {
    id: "lib1",
    name: "Weighted Sit-Up",
    muscleGroup: "腹部",
    color: "#FF2D55",
    note: "Do this first — you'll have more energy at the start.\nHold at the top for 2–5 sec. Keep lower back arched forward (but don't fully extend!).\nPrioritise form over load.\n15kg: aim for 5–10 reps per set, no more than 10.",
    history: [
      {
        date: "2026-03-09",
        workoutId: 1,
        equipment: "Incline angle 5, plate held against chest",
        weightSets: [
          {
            weight: "15kg",
            reps: [
              10,
              5,
              5
            ]
          },
          {
            weight: "10kg",
            reps: [
              5,
              5
            ]
          }
        ],
        feeling: "I want a perfect soul\n-\nFelt solid today. First few sets at 15kg were clean, dropped off toward the end — switched to 10kg to finish.",
        mode: "weight_sets"
      },
      {
        date: "2026-06-15",
        workoutId: "189a1b42-3887-482c-b3dd-7ff39a6d68a0",
        mode: "weight_sets",
        equipment: "Incline angle 5, plate held against chest",
        weightSets: [
          {
            weight: "15kg",
            reps: [
              10,
              5,
              5
            ]
          },
          {
            weight: "10kg",
            reps: [
              5,
              5
            ]
          }
        ],
        feeling: "Your skin makes me cry"
      },
      {
        date: "2026-09-30",
        workoutId: "c8fab681-c5b2-4969-85ee-61e4bc0d0ab2",
        mode: "weight_sets",
        equipment: "Incline angle 5, plate held against chest",
        weightSets: [
          {
            weight: "15kg",
            reps: [
              10,
              5,
              5
            ]
          },
          {
            weight: "10kg",
            reps: [
              5,
              5
            ]
          }
        ],
        feeling: "This is a sample data. Feel free to clear it!\nStart Fresh (available in the About Page), remove all these sample data, and start from day one!"
      },
      {
        date: "2026-10-02",
        workoutId: "f953f926-2c33-4522-a574-650b00b6ca6f",
        mode: "weight_sets",
        equipment: "Incline angle 5, plate held against chest",
        weightSets: [
          {
            weight: "15kg",
            reps: [
              10,
              5,
              5
            ]
          },
          {
            weight: "10kg",
            reps: [
              5,
              5
            ]
          }
        ],
        feeling: "This is a sample data. Feel free to clear it!\nStart Fresh (available in the About Page), remove all these sample data, and start from day one!"
      }
    ]
  },
  {
    id: "lib2",
    name: "Barbell Bench Press",
    muscleGroup: "胸肌",
    color: "#FF6B6B",
    note: "Chest up, scapulae retracted, core braced, slight arch in back. Grip the bar with wrists bent down so the heel of the palm takes the load.\nLower to chest-level for maximum pec activation.\nSet up so the bar is directly above your eyes. Bar weighs 30kg.",
    history: [
      {
        date: "2026-02-21",
        workoutId: "8b20aab5-c149-4dee-a8b8-b1dc813d5c55",
        mode: "weight_sets",
        equipment: "Rack height: pin 5 (top). Safety bars at lowest effective pin.\nAdjustable bench: angle 1–2",
        weightSets: [
          {
            weight: "15kg",
            reps: [
              4,
              3,
              3
            ]
          },
          {
            weight: "10kg",
            reps: [
              5,
              4,
              3
            ]
          }
        ],
        feeling: "I don't belong here\n-\nThis is a sample data. Feel free to clear it!\nStart Fresh (available in the About Page), remove all these sample data, and start from day one!"
      },
      {
        date: "2026-03-09",
        workoutId: 1,
        equipment: "Rack height: pin 5 (top). Safety bars at lowest effective pin.\nAdjustable bench: angle 1–2",
        weightSets: [
          {
            weight: "15kg",
            reps: [
              4,
              3,
              3
            ]
          },
          {
            weight: "10kg",
            reps: [
              5,
              4,
              3
            ]
          }
        ],
        feeling: "I WANT A PERFECT BODY\n-\nJoints felt tight today. Realised it's a mobility issue, not a strength issue. Will try shoulder warm-ups next time.",
        mode: "weight_sets"
      },
      {
        date: "2026-05-23",
        workoutId: "6a8967b3-f3cd-4958-ab22-bb35d4b46005",
        mode: "weight_sets",
        equipment: "Rack height: pin 5 (top). Safety bars at lowest effective pin.\nAdjustable bench: angle 1–2",
        weightSets: [
          {
            weight: "15kg",
            reps: [
              4,
              3,
              3
            ]
          },
          {
            weight: "10kg",
            reps: [
              5,
              4,
              3
            ]
          }
        ],
        feeling: "You're so fuckin' special"
      },
      {
        date: "2026-09-30",
        workoutId: "d4c48a27-66a3-49e7-b6d4-c49b1e34b867",
        mode: "weight_sets",
        equipment: "Rack height: pin 5 (top). Safety bars at lowest effective pin.\nAdjustable bench: angle 1–2",
        weightSets: [
          {
            weight: "15kg",
            reps: [
              4,
              3,
              3
            ]
          },
          {
            weight: "10kg",
            reps: [
              5,
              4,
              3
            ]
          }
        ],
        feeling: "This is a sample data. Feel free to clear it!\nStart Fresh (available in the About Page), remove all these sample data, and start from day one!"
      }
    ]
  },
  {
    id: "lib3",
    name: "Pull-Up",
    muscleGroup: "背部",
    color: "#34C759",
    note: "Depress scapulae before pulling — don't shrug. Hold at the top for 1 sec.",
    history: [
      {
        date: "2026-03-07",
        workoutId: 2,
        equipment: "Bodyweight",
        weightSets: [
          {
            weight: "BW",
            reps: [
              8,
              7,
              6
            ]
          }
        ],
        feeling: "When I'm not around\n-\nFelt noticeably easier than last week. Progress is showing.",
        mode: "weight_sets"
      }
    ]
  },
  {
    id: "lib4",
    name: "Deadlift",
    muscleGroup: "背部",
    color: "#34C759",
    note: "Keep a neutral spine throughout — no rounding! Brace your core hard.\nControl the descent, don't just drop the bar.",
    history: [
      {
        date: "2026-03-07",
        workoutId: 2,
        equipment: "Olympic barbell (20kg bar)",
        weightSets: [
          {
            weight: "60kg",
            reps: [
              5,
              5,
              5
            ]
          },
          {
            weight: "80kg",
            reps: [
              3,
              3
            ]
          }
        ],
        feeling: "I want you to notice\n-\nLast rep at 80kg had a slight lower-back rounding. Watch that next time. Overall decent session.",
        mode: "weight_sets"
      },
      {
        date: "2026-09-10",
        workoutId: "d46db2dd-bb36-4004-aa7d-cda893237b01",
        mode: "weight_sets",
        equipment: "Olympic barbell (20kg bar)",
        weightSets: [
          {
            weight: "60kg",
            reps: [
              5,
              5,
              5
            ]
          },
          {
            weight: "80kg",
            reps: [
              3,
              3
            ]
          }
        ],
        feeling: "This is a sample data. Feel free to clear it!\nStart Fresh (available in the About Page), remove all these sample data, and start from day one!"
      }
    ]
  },
  {
    id: "lib5",
    name: "Lat Pulldown",
    muscleGroup: "背部",
    color: "#34C759",
    note: "48kg: target 5 reps × 2 sets.\n41kg: more volume — target 5 reps × 3 sets.",
    history: [
      {
        date: "2026-02-23",
        workoutId: 5,
        equipment: "Lat pulldown / cable row machine",
        weightSets: [
          {
            weight: "48kg",
            reps: [
              5,
              5
            ]
          },
          {
            weight: "41kg",
            reps: [
              5,
              5,
              5
            ]
          }
        ],
        feeling: "I'm a weirdo\n-\n48kg felt heavy but hit the target sets. 41kg felt smooth.",
        mode: "weight_sets"
      },
      {
        date: "2026-05-18",
        workoutId: "0481ba94-9886-44dd-9801-d040316b462b",
        mode: "weight_sets",
        equipment: "Lat pulldown / cable row machine",
        weightSets: [
          {
            weight: "48kg",
            reps: [
              5,
              5
            ]
          },
          {
            weight: "41kg",
            reps: [
              5,
              5,
              5
            ]
          }
        ],
        feeling: "But I'm a creep"
      },
      {
        date: "2026-08-10",
        workoutId: "b47084c1-3e6c-4be1-a117-8cd9a6556b57",
        mode: "weight_sets",
        equipment: "Lat pulldown / cable row machine",
        weightSets: [
          {
            weight: "48kg",
            reps: [
              5,
              5,
              5,
              5
            ]
          },
          {
            weight: "41kg",
            reps: [
              9,
              5,
              5
            ]
          }
        ],
        feeling: "This is a sample data. Feel free to clear it!\nStart Fresh (available in the About Page), remove all these sample data, and start from day one!\n-\nFelt more lats today. \nThis prolly means I've improved. "
      }
    ]
  },
  {
    id: "lib6",
    name: "Back Squat",
    muscleGroup: "腿部",
    color: "#007AFF",
    note: "Track knees over toes — no caving in. Back straight, eyes slightly up.",
    history: [
      {
        date: "2026-03-04",
        workoutId: 3,
        equipment: "Squat rack, pin height 4. Bar weighs 20kg.",
        weightSets: [
          {
            weight: "40kg",
            reps: [
              8,
              8,
              6
            ]
          },
          {
            weight: "50kg",
            reps: [
              5,
              5
            ]
          }
        ],
        feeling: "I wish I was special\n-\n50kg felt shaky going down — need to work on core stability under load.",
        mode: "weight_sets"
      },
      {
        date: "2026-08-10",
        workoutId: "b01a87c9-1fc0-4c6c-9885-3d4f4c63abf4",
        mode: "weight_sets",
        equipment: "Squat rack, pin height 4. Bar weighs 20kg.",
        weightSets: [
          {
            weight: "40kg",
            reps: [
              8,
              8,
              6
            ]
          },
          {
            weight: "50kg",
            reps: [
              5,
              5
            ]
          }
        ],
        feeling: "This is a sample data. Feel free to clear it!\nStart Fresh (available in the About Page), remove all these sample data, and start from day one!\n-\nGive me gorgeous butt pleasssssse"
      }
    ]
  },
  {
    id: "lib7",
    name: "Leg Press",
    muscleGroup: "腿部",
    color: "#007AFF",
    note: "Don't lock out the knees at the top. Keep a slight bend throughout.",
    history: [
      {
        date: "2026-03-04",
        workoutId: 3,
        equipment: "Leg press machine, shoulder-width foot placement",
        weightSets: [
          {
            weight: "80kg",
            reps: [
              12,
              10,
              10
            ]
          }
        ],
        feeling: "You're so fuckin' special\n-\nFelt manageable. Can probably go heavier next session.",
        mode: "weight_sets"
      },
      {
        date: "2026-07-20",
        workoutId: "bd6c8e28-4ce9-4fad-a194-5dab7cc3fc0b",
        mode: "weight_sets",
        equipment: "Leg press machine, shoulder-width foot placement",
        weightSets: [
          {
            weight: "80kg",
            reps: [
              12,
              10,
              10
            ]
          }
        ],
        feeling: "Couldn't look you in the eye"
      }
    ]
  },
  {
    id: "lib8",
    name: "Dumbbell Shoulder Press",
    muscleGroup: "肩部",
    color: "#FF9500",
    note: "Brace core throughout — don't lean back. Keep elbows slightly in front of the body.",
    history: [
      {
        date: "2026-03-01",
        workoutId: 4,
        equipment: "Dumbbells, standing",
        weightSets: [
          {
            weight: "12kg",
            reps: [
              10,
              8,
              8
            ]
          }
        ],
        feeling: "But I'm a creep\n-\nLast few reps were tough but kept form intact throughout.",
        mode: "weight_sets"
      },
      {
        date: "2026-06-04",
        workoutId: "b2a6fc25-03bc-4365-b390-5f841d817555",
        mode: "weight_sets",
        equipment: "Dumbbells, standing",
        weightSets: [
          {
            weight: "12kg",
            reps: [
              10,
              8,
              8
            ]
          }
        ],
        feeling: "You float like a feather"
      }
    ]
  },
  {
    id: "lib9",
    name: "Treadmill",
    muscleGroup: "有氧",
    color: "#5AC8FA",
    recordingMode: "length_pace",
    note: "Pure running: at least 2km. Walk intervals: 0.5km.\nTotal session: 30 min.\nTarget: sustain speed 7.5 for at least 4.5 laps (each lap = 0.4km).",
    history: [
      {
        date: "2026-02-23",
        workoutId: 5,
        equipment: "Treadmill (new model)",
        mode: "length_pace",
        lengthPace: [
          {
            distance: 2,
            unit: "km",
            paceMin: 6,
            paceSec: 30
          },
          {
            distance: 0.5,
            unit: "km",
            paceMin: 12,
            paceSec: 0
          }
        ],
        feeling: "What the hell am I doing here?\n-\nDidn't hit the speed target this time. Covered 2.5km total (run/walk mix)."
      },
      {
        date: "2026-04-20",
        workoutId: "857aa004-f584-4efb-a553-10652a143e9c",
        mode: "length_pace",
        equipment: "Treadmill (new model)",
        lengthPace: [
          {
            distance: 2,
            unit: "km",
            paceMin: 6,
            paceSec: 30
          },
          {
            distance: 0.5,
            unit: "km",
            paceMin: 12,
            paceSec: 0
          }
        ],
        feeling: "What the hell am I doing here?"
      },
      {
        date: "2026-04-26",
        workoutId: "f88c6181-3cc3-40f7-bfb9-10805febfa71",
        mode: "length_pace",
        equipment: "Treadmill (new model)",
        lengthPace: [
          {
            distance: 2,
            unit: "km",
            paceMin: 6,
            paceSec: 30
          },
          {
            distance: 0.5,
            unit: "km",
            paceMin: 12,
            paceSec: 0
          }
        ],
        feeling: "I'm a weirdo"
      },
      {
        date: "2026-07-22",
        workoutId: "ed255c84-2b04-42c3-9cf4-8205e1e21110",
        mode: "length_pace",
        equipment: "Treadmill (new model)",
        lengthPace: [
          {
            distance: 2,
            unit: "km",
            paceMin: 6,
            paceSec: 37
          }
        ],
        feeling: "When you were here before"
      },
      {
        date: "2026-08-23",
        workoutId: "5acc1bbc-234c-4147-8007-bfaaae39e350",
        mode: "length_pace",
        equipment: "Treadmill (new model)",
        lengthPace: [
          {
            distance: 2,
            unit: "km",
            paceMin: 6,
            paceSec: 30
          },
          {
            distance: 0.5,
            unit: "km",
            paceMin: 12,
            paceSec: 0
          }
        ],
        feeling: "This is a sample data. Feel free to clear it!\nStart Fresh (available in the About Page), remove all these sample data, and start from day one!\n-\ntreadmills really killing me..."
      }
    ]
  },
  {
    id: "lib10",
    name: "Dumbbell Bicep Curl",
    muscleGroup: "手臂",
    color: "#AF52DE",
    note: "",
    history: []
  },
  {
    id: "lib11",
    name: "Tricep Dips",
    muscleGroup: "手臂",
    color: "#5856D6",
    note: "legs curled on dip rack.\n- Slow pace, Hold on top, feel your tricep\n- Keep the motion straight & stable\n- Chest pushed out, look horizontally to the front",
    history: [
      {
        date: "2026-06-04",
        workoutId: "ca7cdf7d-1720-4472-8870-81096b2cd251",
        mode: "weight_sets",
        equipment: "Selfweight Dips",
        weightSets: [
          {
            weight: "BW",
            reps: [
              6,
              5,
              4
            ]
          }
        ],
        feeling: "In a beautiful world\n-\ndid good today, stable and slow. \nthe last 2-3 reps done dirty. "
      }
    ],
    recordingMode: "weight_sets"
  },
  {
    id: "lib12",
    name: "Lateral Raise",
    muscleGroup: "肩部",
    color: "#FF9500",
    note: "This machine goes hard on shoulders. Real hard. \nTry to keep L&R balanced, hold on top 1 sec. ",
    history: [
      {
        date: "2026-04-12",
        workoutId: "087f2db5-9327-488f-a437-b0fd1391f5f1",
        mode: "weight_sets",
        equipment: "Seat height: 3",
        weightSets: [
          {
            weight: "70 lbs",
            reps: [
              7,
              6,
              5
            ]
          }
        ],
        feeling: "I don't belong here"
      },
      {
        date: "2026-07-03",
        workoutId: "1b60ec09-5e25-4906-b9d3-4e9cddda2c6f",
        mode: "weight_sets",
        equipment: "Seat height: 3",
        weightSets: [
          {
            weight: "70 lbs",
            reps: [
              7,
              5,
              5
            ]
          }
        ],
        feeling: "You're just like an angel"
      },
      {
        date: "2026-10-10",
        workoutId: "f5ac343e-7f41-4503-981b-a20a6dc9700f",
        mode: "weight_sets",
        equipment: "Seat height: 3",
        weightSets: [
          {
            weight: "70 lbs",
            reps: [
              7,
              5,
              5
            ]
          }
        ],
        feeling: "This is a sample data. Feel free to clear it!\nStart Fresh (available in the About Page), remove all these sample data, and start from day one!"
      }
    ],
    recordingMode: "weight_sets"
  },
  {
    id: "lib13",
    name: "Natural Running",
    muscleGroup: "有氧",
    color: "#5AC8FA",
    recordingMode: "length_pace",
    note: "Forefoot strike. Use minimalist / barefoot shoes.\nHigh demand on arches, Achilles, and calves — build up gradually.\nAt least 2km per session. No heel striking!\nFeel the arch spring you forward — totally different from cushioned shoes.",
    history: [
      {
        date: "2026-03-15",
        workoutId: 6,
        equipment: "Rubber track (400m per lap)",
        mode: "length_pace",
        lengthPace: [
          {
            distance: 0.8,
            unit: "km",
            paceMin: 6,
            paceSec: 0
          },
          {
            distance: 0.4,
            unit: "km",
            paceMin: 11,
            paceSec: 0
          },
          {
            distance: 0.8,
            unit: "km",
            paceMin: 6,
            paceSec: 10
          },
          {
            distance: 0.4,
            unit: "km",
            paceMin: 11,
            paceSec: 0
          },
          {
            distance: 0.4,
            unit: "km",
            paceMin: 6,
            paceSec: 5
          }
        ],
        feeling: "I want to have control\n-\n2 laps run + 1 lap walk + 2 laps run + 1 lap walk + 1 lap run. Barefoot running felt completely different. Calves definitely worked."
      },
      {
        date: "2026-08-20",
        workoutId: "b301507c-4dab-4ea7-9b93-3ef5ae8f9d74",
        mode: "length_pace",
        equipment: "Rubber track (400m per lap)",
        lengthPace: [
          {
            distance: 3.8,
            unit: "km",
            paceMin: 9,
            paceSec: 13
          }
        ],
        feeling: "This is a sample data. Feel free to clear it!\nStart Fresh (available in the About Page), remove all these sample data, and start from day one!"
      }
    ]
  },
  {
    id: "lib14",
    name: "Breaststroke",
    muscleGroup: "有氧",
    color: "#5AC8FA",
    note: "Sessions: 1.5–2 hours. At least 5 lengths total.\nAt least one full length each way without stopping.",
    history: [
      {
        date: "2026-03-15",
        workoutId: 6,
        equipment: "Pool (25m length)",
        weightSets: [
          {
            weight: "BW",
            reps: [
              1
            ]
          }
        ],
        feeling: "I don't care if it hurts\n-\n2-hour session. Felt strong — completed at least one unbroken length each way.",
        mode: "weight_sets"
      },
      {
        date: "2026-05-27",
        workoutId: "5701d534-1025-4cc8-a8cc-bb8381643d12",
        mode: "weight_sets",
        equipment: "Pool (25m length)",
        weightSets: [
          {
            weight: "BW",
            reps: [
              2
            ]
          }
        ],
        feeling: "I wish I was special"
      },
      {
        date: "2026-09-23",
        workoutId: "4707be06-2aa1-4d44-987e-e39b21702df1",
        mode: "weight_sets",
        equipment: "Pool (25m length)",
        weightSets: [
          {
            weight: "BW",
            reps: [
              2
            ]
          }
        ],
        feeling: "This is a sample data. Feel free to clear it!\nStart Fresh (available in the About Page), remove all these sample data, and start from day one!\n-\nFelt like staying longer in the pool.\nHad a relaxed 2 hour session."
      }
    ]
  }
];

export const INIT_WORKOUTS = [
  {
    id: "f5ac343e-7f41-4503-981b-a20a6dc9700f",
    date: "2026-10-10",
    weekday: "Saturday",
    muscleGroups: [
      "肩部"
    ],
    exercises: [
      {
        libId: "lib12",
        mode: "weight_sets",
        equipment: "Seat height: 3",
        weightSets: [
          {
            weight: "70 lbs",
            reps: [
              7,
              5,
              5
            ]
          }
        ],
        feeling: "This is a sample data. Feel free to clear it!\nStart Fresh (available in the About Page), remove all these sample data, and start from day one!"
      }
    ]
  },
  {
    id: "f953f926-2c33-4522-a574-650b00b6ca6f",
    date: "2026-10-02",
    weekday: "Friday",
    muscleGroups: [
      "腹部"
    ],
    exercises: [
      {
        libId: "lib1",
        mode: "weight_sets",
        equipment: "Incline angle 5, plate held against chest",
        weightSets: [
          {
            weight: "15kg",
            reps: [
              10,
              5,
              5
            ]
          },
          {
            weight: "10kg",
            reps: [
              5,
              5
            ]
          }
        ],
        feeling: "This is a sample data. Feel free to clear it!\nStart Fresh (available in the About Page), remove all these sample data, and start from day one!"
      }
    ]
  },
  {
    id: "c8fab681-c5b2-4969-85ee-61e4bc0d0ab2",
    date: "2026-09-30",
    weekday: "Wednesday",
    muscleGroups: [
      "腹部"
    ],
    exercises: [
      {
        libId: "lib1",
        mode: "weight_sets",
        equipment: "Incline angle 5, plate held against chest",
        weightSets: [
          {
            weight: "15kg",
            reps: [
              10,
              5,
              5
            ]
          },
          {
            weight: "10kg",
            reps: [
              5,
              5
            ]
          }
        ],
        feeling: "This is a sample data. Feel free to clear it!\nStart Fresh (available in the About Page), remove all these sample data, and start from day one!"
      }
    ]
  },
  {
    id: "d4c48a27-66a3-49e7-b6d4-c49b1e34b867",
    date: "2026-09-30",
    weekday: "Wednesday",
    muscleGroups: [
      "胸肌"
    ],
    exercises: [
      {
        libId: "lib2",
        mode: "weight_sets",
        equipment: "Rack height: pin 5 (top). Safety bars at lowest effective pin.\nAdjustable bench: angle 1–2",
        weightSets: [
          {
            weight: "15kg",
            reps: [
              4,
              3,
              3
            ]
          },
          {
            weight: "10kg",
            reps: [
              5,
              4,
              3
            ]
          }
        ],
        feeling: "This is a sample data. Feel free to clear it!\nStart Fresh (available in the About Page), remove all these sample data, and start from day one!"
      }
    ]
  },
  {
    id: "4707be06-2aa1-4d44-987e-e39b21702df1",
    date: "2026-09-23",
    weekday: "Wednesday",
    muscleGroups: [
      "有氧"
    ],
    exercises: [
      {
        libId: "lib14",
        mode: "weight_sets",
        equipment: "Pool (25m length)",
        weightSets: [
          {
            weight: "BW",
            reps: [
              2
            ]
          }
        ],
        feeling: "This is a sample data. Feel free to clear it!\nStart Fresh (available in the About Page), remove all these sample data, and start from day one!\n-\nFelt like staying longer in the pool.\nHad a relaxed 2 hour session."
      }
    ]
  },
  {
    id: "d46db2dd-bb36-4004-aa7d-cda893237b01",
    date: "2026-09-10",
    weekday: "Thursday",
    muscleGroups: [
      "背部"
    ],
    exercises: [
      {
        libId: "lib4",
        mode: "weight_sets",
        equipment: "Olympic barbell (20kg bar)",
        weightSets: [
          {
            weight: "60kg",
            reps: [
              5,
              5,
              5
            ]
          },
          {
            weight: "80kg",
            reps: [
              3,
              3
            ]
          }
        ],
        feeling: "This is a sample data. Feel free to clear it!\nStart Fresh (available in the About Page), remove all these sample data, and start from day one!"
      }
    ]
  },
  {
    id: "5acc1bbc-234c-4147-8007-bfaaae39e350",
    date: "2026-08-23",
    weekday: "Sunday",
    muscleGroups: [
      "有氧"
    ],
    exercises: [
      {
        libId: "lib9",
        mode: "length_pace",
        equipment: "Treadmill (new model)",
        lengthPace: [
          {
            distance: 2,
            unit: "km",
            paceMin: 6,
            paceSec: 30
          },
          {
            distance: 0.5,
            unit: "km",
            paceMin: 12,
            paceSec: 0
          }
        ],
        feeling: "This is a sample data. Feel free to clear it!\nStart Fresh (available in the About Page), remove all these sample data, and start from day one!\n-\ntreadmills really killing me..."
      }
    ]
  },
  {
    id: "b301507c-4dab-4ea7-9b93-3ef5ae8f9d74",
    date: "2026-08-20",
    weekday: "Thursday",
    muscleGroups: [
      "有氧"
    ],
    exercises: [
      {
        libId: "lib13",
        mode: "length_pace",
        equipment: "Rubber track (400m per lap)",
        lengthPace: [
          {
            distance: 3.8,
            unit: "km",
            paceMin: 9,
            paceSec: 13
          }
        ],
        feeling: "This is a sample data. Feel free to clear it!\nStart Fresh (available in the About Page), remove all these sample data, and start from day one!"
      }
    ]
  },
  {
    id: "b01a87c9-1fc0-4c6c-9885-3d4f4c63abf4",
    date: "2026-08-10",
    weekday: "Monday",
    muscleGroups: [
      "腿部"
    ],
    exercises: [
      {
        libId: "lib6",
        mode: "weight_sets",
        equipment: "Squat rack, pin height 4. Bar weighs 20kg.",
        weightSets: [
          {
            weight: "40kg",
            reps: [
              8,
              8,
              6
            ]
          },
          {
            weight: "50kg",
            reps: [
              5,
              5
            ]
          }
        ],
        feeling: "This is a sample data. Feel free to clear it!\nStart Fresh (available in the About Page), remove all these sample data, and start from day one!\n-\nGive me gorgeous butt pleasssssse"
      }
    ]
  },
  {
    id: "b47084c1-3e6c-4be1-a117-8cd9a6556b57",
    date: "2026-08-10",
    weekday: "Monday",
    muscleGroups: [
      "背部"
    ],
    exercises: [
      {
        libId: "lib5",
        mode: "weight_sets",
        equipment: "Lat pulldown / cable row machine",
        weightSets: [
          {
            weight: "48kg",
            reps: [
              5,
              5,
              5,
              5
            ]
          },
          {
            weight: "41kg",
            reps: [
              9,
              5,
              5
            ]
          }
        ],
        feeling: "This is a sample data. Feel free to clear it!\nStart Fresh (available in the About Page), remove all these sample data, and start from day one!\n-\nFelt more lats today. \nThis prolly means I've improved. "
      }
    ]
  },
  {
    id: "ed255c84-2b04-42c3-9cf4-8205e1e21110",
    date: "2026-07-22",
    weekday: "Wednesday",
    muscleGroups: [
      "有氧"
    ],
    exercises: [
      {
        libId: "lib9",
        mode: "length_pace",
        equipment: "Treadmill (new model)",
        lengthPace: [
          {
            distance: 2,
            unit: "km",
            paceMin: 6,
            paceSec: 37
          }
        ],
        feeling: "When you were here before"
      }
    ]
  },
  {
    id: "bd6c8e28-4ce9-4fad-a194-5dab7cc3fc0b",
    date: "2026-07-20",
    weekday: "Monday",
    muscleGroups: [
      "腿部"
    ],
    exercises: [
      {
        libId: "lib7",
        mode: "weight_sets",
        equipment: "Leg press machine, shoulder-width foot placement",
        weightSets: [
          {
            weight: "80kg",
            reps: [
              12,
              10,
              10
            ]
          }
        ],
        feeling: "Couldn't look you in the eye"
      }
    ]
  },
  {
    id: "1b60ec09-5e25-4906-b9d3-4e9cddda2c6f",
    date: "2026-07-03",
    weekday: "Friday",
    muscleGroups: [
      "肩部"
    ],
    exercises: [
      {
        libId: "lib12",
        mode: "weight_sets",
        equipment: "Seat height: 3",
        weightSets: [
          {
            weight: "70 lbs",
            reps: [
              7,
              5,
              5
            ]
          }
        ],
        feeling: "You're just like an angel"
      }
    ]
  },
  {
    id: "189a1b42-3887-482c-b3dd-7ff39a6d68a0",
    date: "2026-06-15",
    weekday: "Monday",
    muscleGroups: [
      "腹部"
    ],
    exercises: [
      {
        libId: "lib1",
        mode: "weight_sets",
        equipment: "Incline angle 5, plate held against chest",
        weightSets: [
          {
            weight: "15kg",
            reps: [
              10,
              5,
              5
            ]
          },
          {
            weight: "10kg",
            reps: [
              5,
              5
            ]
          }
        ],
        feeling: "Your skin makes me cry"
      }
    ]
  },
  {
    id: "b2a6fc25-03bc-4365-b390-5f841d817555",
    date: "2026-06-04",
    weekday: "Thursday",
    muscleGroups: [
      "肩部"
    ],
    exercises: [
      {
        libId: "lib8",
        mode: "weight_sets",
        equipment: "Dumbbells, standing",
        weightSets: [
          {
            weight: "12kg",
            reps: [
              10,
              8,
              8
            ]
          }
        ],
        feeling: "You float like a feather"
      }
    ]
  },
  {
    id: "ca7cdf7d-1720-4472-8870-81096b2cd251",
    date: "2026-06-04",
    weekday: "Thursday",
    muscleGroups: [
      "手臂"
    ],
    exercises: [
      {
        libId: "lib11",
        mode: "weight_sets",
        equipment: "Selfweight Dips",
        weightSets: [
          {
            weight: "BW",
            reps: [
              6,
              5,
              4
            ]
          }
        ],
        feeling: "In a beautiful world\n-\ndid good today, stable and slow. \nthe last 2-3 reps done dirty. "
      }
    ]
  },
  {
    id: "5701d534-1025-4cc8-a8cc-bb8381643d12",
    date: "2026-05-27",
    weekday: "Wednesday",
    muscleGroups: [
      "有氧"
    ],
    exercises: [
      {
        libId: "lib14",
        mode: "weight_sets",
        equipment: "Pool (25m length)",
        weightSets: [
          {
            weight: "BW",
            reps: [
              2
            ]
          }
        ],
        feeling: "I wish I was special"
      }
    ]
  },
  {
    id: "6a8967b3-f3cd-4958-ab22-bb35d4b46005",
    date: "2026-05-23",
    weekday: "Saturday",
    muscleGroups: [
      "胸肌"
    ],
    exercises: [
      {
        libId: "lib2",
        mode: "weight_sets",
        equipment: "Rack height: pin 5 (top). Safety bars at lowest effective pin.\nAdjustable bench: angle 1–2",
        weightSets: [
          {
            weight: "15kg",
            reps: [
              4,
              3,
              3
            ]
          },
          {
            weight: "10kg",
            reps: [
              5,
              4,
              3
            ]
          }
        ],
        feeling: "You're so fuckin' special"
      }
    ]
  },
  {
    id: "0481ba94-9886-44dd-9801-d040316b462b",
    date: "2026-05-18",
    weekday: "Monday",
    muscleGroups: [
      "背部"
    ],
    exercises: [
      {
        libId: "lib5",
        mode: "weight_sets",
        equipment: "Lat pulldown / cable row machine",
        weightSets: [
          {
            weight: "48kg",
            reps: [
              5,
              5
            ]
          },
          {
            weight: "41kg",
            reps: [
              5,
              5,
              5
            ]
          }
        ],
        feeling: "But I'm a creep"
      }
    ]
  },
  {
    id: "f88c6181-3cc3-40f7-bfb9-10805febfa71",
    date: "2026-04-26",
    weekday: "Sunday",
    muscleGroups: [
      "有氧"
    ],
    exercises: [
      {
        libId: "lib9",
        mode: "length_pace",
        equipment: "Treadmill (new model)",
        lengthPace: [
          {
            distance: 2,
            unit: "km",
            paceMin: 6,
            paceSec: 30
          },
          {
            distance: 0.5,
            unit: "km",
            paceMin: 12,
            paceSec: 0
          }
        ],
        feeling: "I'm a weirdo"
      }
    ]
  },
  {
    id: "857aa004-f584-4efb-a553-10652a143e9c",
    date: "2026-04-20",
    weekday: "Monday",
    muscleGroups: [
      "有氧"
    ],
    exercises: [
      {
        libId: "lib9",
        mode: "length_pace",
        equipment: "Treadmill (new model)",
        lengthPace: [
          {
            distance: 2,
            unit: "km",
            paceMin: 6,
            paceSec: 30
          },
          {
            distance: 0.5,
            unit: "km",
            paceMin: 12,
            paceSec: 0
          }
        ],
        feeling: "What the hell am I doing here?"
      }
    ]
  },
  {
    id: "087f2db5-9327-488f-a437-b0fd1391f5f1",
    date: "2026-04-12",
    weekday: "Sunday",
    muscleGroups: [
      "肩部"
    ],
    exercises: [
      {
        libId: "lib12",
        mode: "weight_sets",
        equipment: "Seat height: 3",
        weightSets: [
          {
            weight: "70 lbs",
            reps: [
              7,
              6,
              5
            ]
          }
        ],
        feeling: "I don't belong here"
      }
    ]
  },
  {
    id: 6,
    date: "2026-03-15",
    weekday: "Sunday",
    muscleGroups: [
      "有氧"
    ],
    exercises: [
      {
        libId: "lib13",
        mode: "length_pace",
        equipment: "Rubber track (400m per lap)",
        lengthPace: [
          {
            distance: 0.8,
            unit: "km",
            paceMin: 6,
            paceSec: 0
          },
          {
            distance: 0.4,
            unit: "km",
            paceMin: 11,
            paceSec: 0
          },
          {
            distance: 0.8,
            unit: "km",
            paceMin: 6,
            paceSec: 10
          },
          {
            distance: 0.4,
            unit: "km",
            paceMin: 11,
            paceSec: 0
          },
          {
            distance: 0.4,
            unit: "km",
            paceMin: 6,
            paceSec: 5
          }
        ],
        feeling: "I want to have control\n-\n2 laps run + 1 lap walk + 2 laps run + 1 lap walk + 1 lap run. Barefoot running felt completely different. Calves definitely worked."
      },
      {
        libId: "lib14",
        mode: "weight_sets",
        equipment: "Pool (25m length)",
        weightSets: [
          {
            weight: "BW",
            reps: [
              1
            ]
          }
        ],
        feeling: "I don't care if it hurts\n-\n2-hour session. Felt strong — completed at least one unbroken length each way."
      }
    ]
  },
  {
    id: 1,
    date: "2026-03-09",
    weekday: "Monday",
    muscleGroups: [
      "腹部",
      "胸肌"
    ],
    exercises: [
      {
        libId: "lib1",
        mode: "weight_sets",
        equipment: "Incline angle 5, plate held against chest",
        weightSets: [
          {
            weight: "15kg",
            reps: [
              10,
              5,
              5
            ]
          },
          {
            weight: "10kg",
            reps: [
              5,
              5
            ]
          }
        ],
        feeling: "I want a perfect soul\n-\nFelt solid today. First few sets at 15kg were clean, dropped off toward the end — switched to 10kg to finish."
      },
      {
        libId: "lib2",
        mode: "weight_sets",
        equipment: "Rack height: pin 5 (top). Safety bars at lowest effective pin.\nAdjustable bench: angle 1–2",
        weightSets: [
          {
            weight: "15kg",
            reps: [
              4,
              3,
              3
            ]
          },
          {
            weight: "10kg",
            reps: [
              5,
              4,
              3
            ]
          }
        ],
        feeling: "I WANT A PERFECT BODY\n-\nJoints felt tight today. Realised it's a mobility issue, not a strength issue. Will try shoulder warm-ups next time."
      }
    ]
  },
  {
    id: 2,
    date: "2026-03-07",
    weekday: "Saturday",
    muscleGroups: [
      "背部"
    ],
    exercises: [
      {
        libId: "lib3",
        mode: "weight_sets",
        equipment: "Bodyweight",
        weightSets: [
          {
            weight: "BW",
            reps: [
              8,
              7,
              6
            ]
          }
        ],
        feeling: "When I'm not around\n-\nFelt noticeably easier than last week. Progress is showing."
      },
      {
        libId: "lib4",
        mode: "weight_sets",
        equipment: "Olympic barbell (20kg bar)",
        weightSets: [
          {
            weight: "60kg",
            reps: [
              5,
              5,
              5
            ]
          },
          {
            weight: "80kg",
            reps: [
              3,
              3
            ]
          }
        ],
        feeling: "I want you to notice\n-\nLast rep at 80kg had a slight lower-back rounding. Watch that next time. Overall decent session."
      }
    ]
  },
  {
    id: 3,
    date: "2026-03-04",
    weekday: "Tuesday",
    muscleGroups: [
      "腿部"
    ],
    exercises: [
      {
        libId: "lib6",
        mode: "weight_sets",
        equipment: "Squat rack, pin height 4. Bar weighs 20kg.",
        weightSets: [
          {
            weight: "40kg",
            reps: [
              8,
              8,
              6
            ]
          },
          {
            weight: "50kg",
            reps: [
              5,
              5
            ]
          }
        ],
        feeling: "I wish I was special\n-\n50kg felt shaky going down — need to work on core stability under load."
      },
      {
        libId: "lib7",
        mode: "weight_sets",
        equipment: "Leg press machine, shoulder-width foot placement",
        weightSets: [
          {
            weight: "80kg",
            reps: [
              12,
              10,
              10
            ]
          }
        ],
        feeling: "You're so fuckin' special\n-\nFelt manageable. Can probably go heavier next session."
      }
    ]
  },
  {
    id: 4,
    date: "2026-03-01",
    weekday: "Sunday",
    muscleGroups: [
      "肩部"
    ],
    exercises: [
      {
        libId: "lib8",
        mode: "weight_sets",
        equipment: "Dumbbells, standing",
        weightSets: [
          {
            weight: "12kg",
            reps: [
              10,
              8,
              8
            ]
          }
        ],
        feeling: "But I'm a creep\n-\nLast few reps were tough but kept form intact throughout."
      }
    ]
  },
  {
    id: 5,
    date: "2026-02-23",
    weekday: "Monday",
    muscleGroups: [
      "腿部",
      "背部"
    ],
    exercises: [
      {
        libId: "lib9",
        mode: "length_pace",
        equipment: "Treadmill (new model)",
        lengthPace: [
          {
            distance: 2,
            unit: "km",
            paceMin: 6,
            paceSec: 30
          },
          {
            distance: 0.5,
            unit: "km",
            paceMin: 12,
            paceSec: 0
          }
        ],
        feeling: "What the hell am I doing here?\n-\nDidn't hit the speed target this time. Covered 2.5km total (run/walk mix)."
      },
      {
        libId: "lib5",
        mode: "weight_sets",
        equipment: "Lat pulldown / cable row machine",
        weightSets: [
          {
            weight: "48kg",
            reps: [
              5,
              5
            ]
          },
          {
            weight: "41kg",
            reps: [
              5,
              5,
              5
            ]
          }
        ],
        feeling: "I'm a weirdo\n-\n48kg felt heavy but hit the target sets. 41kg felt smooth."
      }
    ]
  },
  {
    id: "8b20aab5-c149-4dee-a8b8-b1dc813d5c55",
    date: "2026-02-21",
    weekday: "Saturday",
    muscleGroups: [
      "胸肌"
    ],
    exercises: [
      {
        libId: "lib2",
        mode: "weight_sets",
        equipment: "Rack height: pin 5 (top). Safety bars at lowest effective pin.\nAdjustable bench: angle 1–2",
        weightSets: [
          {
            weight: "15kg",
            reps: [
              4,
              3,
              3
            ]
          },
          {
            weight: "10kg",
            reps: [
              5,
              4,
              3
            ]
          }
        ],
        feeling: "I don't belong here\n-\nThis is a sample data. Feel free to clear it!\nStart Fresh (available in the About Page), remove all these sample data, and start from day one!"
      }
    ]
  }
];

export const INIT_ROUTINES = [
  {
    id: "57e93aa7-d7dd-40ee-b976-27b48a311ad8",
    period: "week",
    matchType: "exercise",
    matchValue: "lib2",
    targetCount: 2
  },
  {
    id: "66f7eec3-d19e-42d6-a125-2fa648a64239",
    period: "month",
    matchType: "muscleGroup",
    matchValue: "有氧",
    targetCount: 7
  },
  {
    id: "7bbba40e-8c14-4178-980b-dc593f2ac836",
    period: "week",
    matchType: "color",
    matchValue: "#34C759",
    targetCount: 2
  },
  {
    id: "a9c94123-cc70-4762-a19b-62f2772613e1",
    period: "week",
    matchType: "muscleGroup",
    matchValue: "腿部",
    targetCount: 1
  }
];
