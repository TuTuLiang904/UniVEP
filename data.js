window.UNIVEP_DATA = {
  "budgets": [
    1,
    2,
    4,
    8,
    10,
    16
  ],
  "models": {
    "star": {
      "name": "StarVLA",
      "series": {
        "v": [
          35.92,
          49.32,
          43.04,
          51.32,
          null,
          53.84
        ],
        "x": [
          40.52,
          41.52,
          42.8,
          42.16,
          null,
          42.52
        ],
        "xv": [
          55.56,
          59.6,
          58.02,
          58.32,
          null,
          59.96
        ],
        "u": [
          61.36,
          63.24,
          61.56,
          64.4,
          null,
          66.88
        ]
      },
      "note": "At one evaluation, UniVEP reaches 61.36%, exceeding the strongest single-target result at 16 evaluations (59.96%). Training uses 50 Clean demonstrations per task."
    },
    "lila": {
      "name": "LiLa-WAM Full",
      "series": {
        "v": [
          67.4,
          80.28,
          81.52,
          82.84,
          83.24,
          81.92
        ],
        "x": [
          73.36,
          72.52,
          73.88,
          74.48,
          75.04,
          75.32
        ],
        "xv": [
          80.12,
          82.68,
          82.08,
          82.56,
          83.48,
          82.6
        ],
        "ux": [
          75.64,
          82.36,
          85.6,
          84.64,
          83.72,
          84.48
        ],
        "u": [
          81.88,
          85.96,
          86.08,
          86.52,
          87.04,
          86.72
        ]
      },
      "note": "With two evaluations, UniVEP reaches 85.96%, above the best single-target result at any measured budget (83.48%). Full training uses 50 Clean + 500 Randomized demonstrations per task."
    },
    "fast": {
      "name": "FastWAM",
      "series": {
        "v": [
          57.2,
          69.64,
          71.24,
          73.36,
          72.64,
          72.52
        ],
        "x": [
          59.64,
          61.76,
          62.8,
          65.64,
          65.72,
          66.92
        ],
        "xv": [
          32.64,
          34.24,
          35.64,
          35.0,
          34.96,
          35.48
        ],
        "u": [
          59.6,
          59.8,
          61.24,
          57.56,
          57.0,
          57.68
        ],
        "ux": [
          66.08,
          66.16,
          66.04,
          66.28,
          66.36,
          66.32
        ]
      },
      "note": "Architecture matters: UniVEP\u2013X improves over direct X, but V-prediction remains strongest at larger budgets. FastWAM retains a video expert pretrained for velocity prediction."
    },
    "scratch": {
      "name": "FastWAM scratch",
      "series": {
        "v": [
          43.24,
          68.2,
          70.04,
          71.32,
          70.84,
          73.12
        ],
        "x": [
          65.68,
          66.52,
          69.5,
          67.48,
          68.2,
          68.96
        ],
        "xv": [
          60.84,
          59.64,
          62.2,
          63.12,
          64.4,
          65.12
        ],
        "u": [
          55.92,
          56.24,
          57.24,
          57.04,
          56.12,
          56.68
        ]
      },
      "note": "Removing action pretraining improves velocity-supervised endpoint prediction, revealing an interaction between prediction target and initialization. The video pathway retains its pretrained velocity objective."
    }
  },
  "provenance": {
    "source": "Latest manuscript, Table 3",
    "file": "sections/empirical_investigation.tex",
    "evaluation": "RoboTwin Clean, equal-weight mean across 50 tasks"
  }
};

window.UNIVEP_DATA.realRobot = {
  "tasks": [
    {
      "id": "drawer",
      "name": "Drawer Cube Place"
    },
    {
      "id": "pick",
      "name": "Pick Two Cube"
    },
    {
      "id": "stick",
      "name": "Grab Stick"
    },
    {
      "id": "mean",
      "name": "Mean across tasks"
    }
  ],
  "series": {
    "v": [
      24,
      32,
      38,
      31.33
    ],
    "x": [
      34,
      34,
      46,
      38.0
    ],
    "xv": [
      38,
      34,
      76,
      49.33
    ],
    "u": [
      52,
      40,
      84,
      58.67
    ]
  },
  "provenance": "Manuscript real-robot evaluation; same values as the on-page table."
};
