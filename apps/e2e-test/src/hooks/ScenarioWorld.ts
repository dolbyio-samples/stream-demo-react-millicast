import { World, IWorldOptions, setWorldConstructor } from '@cucumber/cucumber';

import { SelectorMapper } from '../utils/selector-mapper';
import { ScenarioData, PlaywrightOptions } from '../utils/types';
import { GlobalData } from './GlobalData';

export class ScenarioWorld extends World {
  currentPage!: unknown;

  currentPageName!: string;

  options!: PlaywrightOptions;

  featureName!: string;

  scenarioName!: string;

  featureNameFormated!: string;

  scenarioNameFormated!: string;

  startTime!: Date;

  debug?: boolean = false;

  localData: ScenarioData;

  globalData!: GlobalData;

  selectorMap!: SelectorMapper;

  constructor(options: IWorldOptions) {
    super(options);
    this.localData = new Map();
  }
}

setWorldConstructor(ScenarioWorld);
