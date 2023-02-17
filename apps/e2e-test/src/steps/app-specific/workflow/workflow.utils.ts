import { ScenarioWorld } from '../../../hooks/ScenarioWorld';
import { logger } from '../../../logger';
import { selectSettingDropdown } from '../../../playwright-support/app-specific/element-action';
import { verifyDeviceStatus } from '../../../playwright-support/app-specific/element-verification';
import { click } from '../../../playwright-support/generic/element-action';
import {
  verifyElementContainsText,
  verifyElementContainsValue,
  verifyElementMatchText,
  verifyElementState,
  verifyElementText,
  verifyElementValue,
} from '../../../playwright-support/generic/element-verification';
import { waitFor } from '../../../playwright-support/generic/element-wait';
import { verifyGreaterThanEqualTo, verifyMatch, verifyEqualTo } from '../../../playwright-support/generic/verification';
import { TargetSelector } from '../../../utils/selector-mapper';
import { State, Status } from '../../../utils/types';
import 'source-map-support/register';

export const validateState = async (
  scWorld: ScenarioWorld,
  targetSelector: TargetSelector,
  expState: string,
  elementIndex?: number | undefined
) => {
  for (const state of expState.split('|')) {
    await waitFor(async () => {
      await verifyElementState(scWorld.currentPage, targetSelector, state as State, false, elementIndex);
    });
  }
};

export const validateStatus = async (
  scWorld: ScenarioWorld,
  targetSelector: TargetSelector,
  expStatus: Status,
  elementIndex?: number | undefined
) => {
  await waitFor(async () => {
    await verifyDeviceStatus(scWorld.currentPage, targetSelector, expStatus, false, elementIndex);
  });
};

export const validateText = async (
  scWorld: ScenarioWorld,
  targetSelector: TargetSelector,
  expText: string,
  elementIndex?: number | undefined
) => {
  // eslint-disable-next-line @typescript-eslint/ban-types
  let verifyMethod: Function;

  if (expText.startsWith('ignore:')) {
    return;
  } else if (expText.startsWith('contains:')) {
    expText = expText.split('contains:')[1].trim();
    verifyMethod = verifyElementContainsText;
  } else if (expText.startsWith('regex:')) {
    expText = expText.split('regex:')[1].trim();
    verifyMethod = verifyElementMatchText;
  } else {
    verifyMethod = verifyElementText;
  }

  await waitFor(async () => {
    await verifyMethod(scWorld.currentPage, targetSelector, expText, false, elementIndex);
  });
};

export const validateValue = async (
  scWorld: ScenarioWorld,
  targetSelector: TargetSelector,
  expValue: string,
  elementIndex?: number | undefined
) => {
  let verifyMethod;

  switch (true) {
    case expValue.startsWith('ignore: '):
      return;
    case expValue.startsWith('contains: '):
      verifyMethod = async () => {
        await verifyElementContainsValue(
          scWorld.currentPage,
          targetSelector,
          expValue.split('contains: ')[1],
          false,
          elementIndex
        );
      };
      break;
    default:
      verifyMethod = async () => {
        await verifyElementValue(scWorld.currentPage, targetSelector, expValue, false, elementIndex);
      };
  }

  await waitFor(verifyMethod);
};

export const validateStatsInfo = (actStats: { [key: string]: string }, expStats: { [key: string]: string }) => {
  const keys = Object.keys(actStats);

  let message = 'Stream Info has less than 5 parameters in stats';
  verifyGreaterThanEqualTo(keys.length, 5, message);

  keys.forEach((key) => {
    logger.info(`Verify stats for key ${key}: ${actStats[key]}`);
    message = `Stats '${key}' not matched`;
    if (expStats[key].startsWith('regex: ')) {
      const pattern = expStats[key].split('regex: ')[1];
      verifyMatch(actStats[key], pattern, message);
    } else {
      verifyEqualTo(actStats[key], expStats[key], message);
    }
  });
};

export const addCamera = async (scWorld: ScenarioWorld) => {
  logger.info(`Add camera source`);
  let targetSelector = scWorld.selectorMap.getSelector(scWorld.currentPageName, 'add cameras button');
  await click(scWorld.currentPage, targetSelector);

  targetSelector = scWorld.selectorMap.getSelector(scWorld.currentPageName, 'select source popup');
  await validateState(scWorld, targetSelector, 'displayed' as State);

  targetSelector = scWorld.selectorMap.getSelector(scWorld.currentPageName, 'select source camera dropdown');
  let OptionsSelector = scWorld.selectorMap.getSelector(
    scWorld.currentPageName,
    'select source camera dropdown options'
  );
  await selectSettingDropdown(scWorld.currentPage, targetSelector, OptionsSelector, 'Fake_device_0');

  targetSelector = scWorld.selectorMap.getSelector(scWorld.currentPageName, 'select source microphone dropdown');
  OptionsSelector = scWorld.selectorMap.getSelector(
    scWorld.currentPageName,
    'select source microphone dropdown options'
  );
  await selectSettingDropdown(scWorld.currentPage, targetSelector, OptionsSelector, 'Fake Audio Input 1');

  targetSelector = scWorld.selectorMap.getSelector(scWorld.currentPageName, 'select source add button');
  await click(scWorld.currentPage, targetSelector);
};

export const addScreen = async (scWorld: ScenarioWorld) => {
  logger.info(`Add screen source`);
  const targetSelector = scWorld.selectorMap.getSelector(scWorld.currentPageName, 'share screen button');
  await click(scWorld.currentPage, targetSelector);
};

export const getQualityTabName = (qualityTab: string) => {
  let qualityTabName = 'None';

  if (qualityTab === null) {
    qualityTabName = 'None';
  } else if (qualityTab.includes('with quality tabs')) {
    qualityTabName = 'All';
  } else if (qualityTab.includes('with high quality tab')) {
    qualityTabName = 'High';
  } else if (qualityTab.includes('with medium quality tab')) {
    qualityTabName = 'Medium';
  } else if (qualityTab.includes('with low quality tab')) {
    qualityTabName = 'Low';
  }

  return qualityTabName;
};
