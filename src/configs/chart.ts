export const RANGE_CONFIG = [
  {
    start: -50,
    end: -10,
    interval: 5,
    color: {
      secondary:
        'linear-gradient(180deg, rgba(189, 195, 147, 0.30) 80%, rgba(189, 195, 147, 0.3) 100%)',
      primary: 'linear-gradient(180deg, #C4CA9C 0%, rgba(189, 195, 147, 0.10) 100%)',
      selected: 'rgba(189, 195, 147, 0.50)',
    },
  },
  {
    start: -9,
    end: -1,
    interval: 1,
    color: {
      secondary:
        'linear-gradient(180deg, rgba(180, 201, 95, 0.30) 80%, rgba(180, 201, 95, 0.3) 100%)',
      primary: 'linear-gradient(180deg, #B4C95F 0%, rgba(180, 201, 95, 0.10) 100%)',
      selected: 'rgba(180, 201, 95, 0.50)',
    },
  },
  {
    start: -0.9,
    end: -0.1,
    interval: 0.1,
    color: {
      secondary:
        'linear-gradient(180deg, rgba(149, 197, 88, 0.30) 80%, rgba(149, 197, 88, 0.3) 100%)',
      primary: 'linear-gradient(180deg, #95C558 0%, rgba(149, 197, 88, 0.10) 100%)',
      selected: 'rgba(149, 197, 88, 0.50)',
    },
  },
  {
    start: -0.09,
    end: -0.01,
    interval: 0.01,
    color: {
      secondary:
        'linear-gradient(180deg, rgba(88, 171, 96, 0.30) 80%, rgba(88, 171, 96, 0.3) 100%)',
      primary: 'linear-gradient(180deg, #58AB60 0%, rgba(88, 171, 96, 0.10) 100%)',
      selected: 'rgba(88, 171, 96, 0.50)',
    },
  },
  {
    start: 0.01,
    end: 0.09,
    interval: 0.01,
    color: {
      secondary:
        'linear-gradient(180deg, rgba(231, 116, 80, 0.30) 80%, rgba(231, 116, 80, 0.3) 100%)',
      primary: 'linear-gradient(180deg, #E77450 0%, rgba(231, 116, 80, 0.10) 100%)',
      selected: 'rgba(231, 116, 80, 0.50)',
    },
  },
  {
    start: 0.1,
    end: 0.9,
    interval: 0.1,
    color: {
      secondary:
        'linear-gradient(180deg, rgba(255, 151, 90, 0.30) 80%, rgba(255, 118, 38, 0.3) 100%)',
      primary: 'linear-gradient(180deg, #FF975A 0%, rgba(255, 118, 38, 0.10) 100%)',
      selected: 'rgba(255, 118, 38, 0.50)',
    },
  },
  {
    start: 1,
    end: 9,
    interval: 1,
    color: {
      secondary:
        'linear-gradient(180deg, rgba(255, 171, 94, 0.30) 80%, rgba(255, 157, 86, 0.3) 100%)',
      primary: 'linear-gradient(180deg, #FFAB5E 0%, rgba(255, 153, 60, 0.10) 100%)',
      selected: 'rgba(255, 153, 60, 0.50)',
    },
  },
  {
    start: 10,
    end: 50,
    interval: 5,
    color: {
      secondary:
        'linear-gradient(180deg, rgba(255, 206, 148, 0.30) 80%, rgba(255, 196, 126, 0.3) 100%)',
      primary: 'linear-gradient(180deg, #FFCE94 0%, rgba(255, 196, 126, 0.10) 100%)',
      selected: 'rgba(255, 196, 126, 0.50)',
    },
  },
];

export const RANGE_TICKS = [-10, -1, -0.1, -0.01, 0.01, 0.1, 1, 10];

export const FILLUP_NEG_CONFIG = RANGE_CONFIG.slice(0, 4);
export const FILLUP_NEG_TICKS = RANGE_TICKS.slice(0, 4);

export const FILLUP_POS_CONFIG = RANGE_CONFIG.slice(4, 8);
export const FILLUP_POS_TICKS = RANGE_TICKS.slice(4, 8);
