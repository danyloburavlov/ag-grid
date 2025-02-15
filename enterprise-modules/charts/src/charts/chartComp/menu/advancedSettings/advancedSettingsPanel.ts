import {
    ChartType,
    Component,
    PostConstruct,
    _
} from "@ag-grid-community/core";
import { ChartSeriesType } from "../../utils/seriesTypeMapper";
import { ChartMenuContext } from "../chartMenuContext";
import { ChartPanelFeature } from "../chartPanelFeature";
import { AnimationPanel } from "./interactivity/animationPanel";
import { CrosshairPanel } from "./interactivity/crosshairPanel";
import { NavigatorPanel } from "./interactivity/navigatorPanel";
import { ZoomPanel } from "./interactivity/zoomPanel";

type ChartInteractivityGroup = 'navigator' | 'zoom' | 'animation' | 'crosshair';

const INTERACTIVITY_GROUPS: ChartInteractivityGroup[] = ['navigator', 'zoom', 'animation', 'crosshair'];

const SUPPORTED_GROUP_PANELS: { [T in ChartSeriesType]?: ChartInteractivityGroup[] } = {
    'bar': ['navigator', 'crosshair'],
    'column': ['navigator', 'crosshair'],
    'line': ['navigator', 'crosshair'],
    'area': ['navigator', 'crosshair'],
    'scatter': ['navigator', 'crosshair'],
    'bubble': ['navigator', 'crosshair'],
    'histogram': ['navigator', 'crosshair'],
    'cartesian': ['navigator', 'crosshair'],
    'range-bar': ['navigator', 'crosshair'],
    'range-area': ['navigator', 'crosshair'],
    'waterfall': ['navigator', 'crosshair'],
    'box-plot': ['navigator', 'crosshair'],
};

export class AdvancedSettingsPanel extends Component {
    private static TEMPLATE = /* html */`<div class="ag-chart-advanced-settings-wrapper"></div>`;

    private chartPanelFeature: ChartPanelFeature;

    constructor(
        private readonly chartMenuContext: ChartMenuContext
    ) {
        super(AdvancedSettingsPanel.TEMPLATE);
    }

    @PostConstruct
    private postConstruct(): void {
        this.chartPanelFeature = this.createManagedBean(new ChartPanelFeature(
            this.chartMenuContext.chartController,
            this.getGui(),
            'ag-chart-advanced-settings-section',
            (chartType, seriesType) => this.createPanels(chartType, seriesType)
        ));
        this.chartPanelFeature.refreshPanels();
    }

    private createPanels(chartType: ChartType, seriesType: ChartSeriesType): void {
        INTERACTIVITY_GROUPS.forEach(group => {
            if (!this.isGroupPanelShownForSeries(group, seriesType)) {
                return;
            }

            const comp = this.createPanel(group);
            if (comp) {
                this.chartPanelFeature.addComponent(comp);
            }
        });
    }

    private isGroupPanelShownForSeries(group: ChartInteractivityGroup, seriesType: ChartSeriesType): boolean {
        if (['zoom', 'animation'].includes(group)) {
            return true;
        }

        return SUPPORTED_GROUP_PANELS[seriesType]?.includes(group) ?? false;
    }

    private createPanel(group: string): Component | null {
        const { chartMenuParamsFactory, chartAxisMenuParamsFactory } = this.chartMenuContext;
        switch (group) {
            case 'navigator':
                return new NavigatorPanel(chartMenuParamsFactory);
            case 'zoom':
                return new ZoomPanel(chartMenuParamsFactory);
            case 'animation':
                return new AnimationPanel(chartMenuParamsFactory);
            case 'crosshair':
                return new CrosshairPanel(chartAxisMenuParamsFactory);
        }
        _.warnOnce(`Invalid charts advanced settings group name supplied: '${group}'`);
        return null;
    }
}
