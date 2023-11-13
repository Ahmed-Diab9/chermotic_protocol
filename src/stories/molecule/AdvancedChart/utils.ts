import { IChartingLibraryWidget } from '~/lib/charting_library';

async function changeTheme(widget: IChartingLibraryWidget, theme: 'dark' | 'light') {
  const transparent = 'rgba(255,255,255,0)';

  const presets = {
    dark: {
      background: transparent,
      text: 'rgba(232, 232, 232, 0.5)',
      border: '#33333a',
      chart: {
        grid: 'rgba(255,255,255,0)',
        down: '#FF3232',
        downArea: 'rgba(255, 50, 50, 0.2)',
        up: '#A6D85B',
        upArea: 'rgba(166, 216, 91, 0.2)',
        middle: '#e8e8e8',
        middleArea: 'rgba(232, 232, 232, 0.28)',
      },
      toolbar: {
        divider: '#33333a',
        active: '#e8e8e8',
        hover: '#333338',
      },
      dropdown: {
        backgound: '#2E2E32',
        active: '#4A4A51',
        hover: '#3A3A41',
      },
    },
    light: {
      background: transparent,
      text: 'rgba(3, 3, 3, 0.5)',
      border: 'rgb(238, 238, 238)',
      chart: {
        grid: 'rgb(238, 238, 238)',
        down: '#FF4F44',
        downArea: 'rgba(255, 50, 50, 0.2)',
        up: '#65CE12',
        upArea: 'rgba(166, 216, 91, 0.2)',
        middle: 'rgb(3, 3, 3)',
        middleArea: 'rgb(3, 3, 3, 0.28)',
      },
      toolbar: {
        divider: 'rgb(238, 238, 238)',
        active: 'rgb(3, 3, 3)',
        hover: 'rgb(238, 238, 238)',
      },
      dropdown: {
        backgound: 'rgb(252, 252, 252)',
        active: 'rgb(238, 238, 238)',
        hover: 'rgb(238, 238, 238)',
      },
    },
  }[theme];

  widget.applyOverrides({
    // legend visibility
    'paneProperties.legendProperties.showBackground': false,
    // background
    'paneProperties.background': presets.background,
    // bottom border
    'paneProperties.separatorColor': presets.border,
    // grid
    'paneProperties.vertGridProperties.color': presets.chart.grid,
    'paneProperties.horzGridProperties.color': presets.chart.grid,
    // text
    'scalesProperties.textColor': presets.text,

    /* candles */
    'mainSeriesProperties.candleStyle.downColor': presets.chart.down,
    'mainSeriesProperties.candleStyle.upColor': presets.chart.up,
    'mainSeriesProperties.candleStyle.borderDownColor': presets.chart.down,
    'mainSeriesProperties.candleStyle.borderUpColor': presets.chart.up,
    'mainSeriesProperties.candleStyle.wickDownColor': presets.chart.down,
    'mainSeriesProperties.candleStyle.wickUpColor': presets.chart.up,
    /* line */
    'mainSeriesProperties.lineStyle.color': presets.chart.middle,
    /* bars */
    'mainSeriesProperties.barStyle.downColor': presets.chart.down,
    'mainSeriesProperties.barStyle.upColor': presets.chart.up,
    /* hollow */
    'mainSeriesProperties.hollowCandleStyle.downColor': presets.chart.down,
    'mainSeriesProperties.hollowCandleStyle.upColor': presets.chart.up,
    'mainSeriesProperties.hollowCandleStyle.borderDownColor': presets.chart.down,
    'mainSeriesProperties.hollowCandleStyle.borderUpColor': presets.chart.up,
    'mainSeriesProperties.hollowCandleStyle.wickDownColor': presets.chart.down,
    'mainSeriesProperties.hollowCandleStyle.wickUpColor': presets.chart.up,
    /* columns */
    'mainSeriesProperties.columnStyle.downColor': presets.chart.down,
    'mainSeriesProperties.columnStyle.upColor': presets.chart.up,
    /* lineWithMarkers */
    'mainSeriesProperties.lineWithMarkersStyle.color': presets.chart.middle,
    /* area */
    'mainSeriesProperties.areaStyle.linecolor': presets.chart.middle,
    'mainSeriesProperties.areaStyle.color1': presets.chart.middleArea,
    'mainSeriesProperties.areaStyle.color2': presets.chart.middle,
    /* hlcArea */
    'mainSeriesProperties.hlcAreaStyle.highLineColor': presets.chart.up,
    'mainSeriesProperties.hlcAreaStyle.highCloseFillColor': presets.chart.upArea,
    'mainSeriesProperties.hlcAreaStyle.closeLineColor': presets.chart.middleArea,
    'mainSeriesProperties.hlcAreaStyle.lowLineColor': presets.chart.down,
    'mainSeriesProperties.hlcAreaStyle.closeLowFillColor': presets.chart.downArea,
    /* baseline */
    'mainSeriesProperties.baselineStyle.topLineColor': presets.chart.up,
    'mainSeriesProperties.baselineStyle.topFillColor1': presets.chart.upArea,
    'mainSeriesProperties.baselineStyle.topFillColor2': presets.chart.upArea,
    'mainSeriesProperties.baselineStyle.bottomLineColor': presets.chart.down,
    'mainSeriesProperties.baselineStyle.bottomFillColor1': presets.chart.downArea,
    'mainSeriesProperties.baselineStyle.bottomFillColor2': presets.chart.downArea,
    /* highLow */
    'mainSeriesProperties.hiloStyle.color': presets.chart.middle,
    'mainSeriesProperties.hiloStyle.borderColor': presets.chart.middle,

    /* Heikin Ashi */
    'mainSeriesProperties.haStyle.downColor': presets.chart.down,
    'mainSeriesProperties.haStyle.upColor': presets.chart.up,
    'mainSeriesProperties.haStyle.borderDownColor': presets.chart.down,
    'mainSeriesProperties.haStyle.borderUpColor': presets.chart.up,
    'mainSeriesProperties.haStyle.wickDownColor': presets.chart.down,
    'mainSeriesProperties.haStyle.wickUpColor': presets.chart.up,
  });

  /* -- Toolbar -- */
  // border
  widget.setCSSCustomProperty('--tv-color-platform-background', presets.background);
  // background
  widget.setCSSCustomProperty('--tv-color-pane-background', presets.background);
  // divider
  widget.setCSSCustomProperty('--tv-color-toolbar-divider-background', presets.toolbar.divider);
  // button:hover
  widget.setCSSCustomProperty('--tv-color-toolbar-button-background-hover', presets.toolbar.hover);
  // button:expanded
  widget.setCSSCustomProperty(
    '--tv-color-toolbar-button-background-expanded',
    presets.toolbar.hover
  );
  // text
  widget.setCSSCustomProperty('--tv-color-toolbar-button-text', presets.text);
  // text:hover
  widget.setCSSCustomProperty('--tv-color-toolbar-button-text-hover', presets.text);
  // text:active
  widget.setCSSCustomProperty('--tv-color-toolbar-button-text-active', presets.toolbar.active);
  widget.setCSSCustomProperty(
    '--tv-color-toolbar-button-text-active-hover',
    presets.toolbar.active
  );

  /* -- Dropdown -- */
  // background
  widget.setCSSCustomProperty('--tv-color-popup-background', presets.dropdown.backgound);
  // divider
  widget.setCSSCustomProperty(
    '--tv-color-popup-element-divider-background',
    presets.dropdown.hover
  );
  // text
  widget.setCSSCustomProperty('--tv-color-popup-element-text', presets.text);
  // text:hover
  widget.setCSSCustomProperty('--tv-color-popup-element-text-hover', presets.text);
  // background:active
  widget.setCSSCustomProperty(
    '--tv-color-popup-element-background-active',
    presets.dropdown.active
  );
  // background:hover
  widget.setCSSCustomProperty('--tv-color-popup-element-background-hover', presets.dropdown.hover);
  // favorite (hidden)
  widget.setCSSCustomProperty(
    '--tv-color-popup-element-toolbox-background-hover',
    presets.dropdown.hover
  );
  widget.setCSSCustomProperty(
    '--tv-color-popup-element-toolbox-background-active-hover',
    presets.dropdown.active
  );
  widget.setCSSCustomProperty('--tv-color-popup-element-toolbox-text', presets.dropdown.hover);
  widget.setCSSCustomProperty(
    '--tv-color-popup-element-toolbox-text-hover',
    presets.dropdown.hover
  );
  widget.setCSSCustomProperty(
    '--tv-color-popup-element-toolbox-text-active-hover',
    presets.dropdown.active
  );

  // Transparent background
  (widget as any)._iFrame.contentDocument.getElementsByClassName(
    'chart-container-border'
  )[0].style.background = 'transparent';
}

export { changeTheme };
