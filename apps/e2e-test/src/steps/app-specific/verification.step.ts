/* eslint-disable func-names */
import { DataTable, Then } from '@cucumber/cucumber';

import { ScenarioWorld } from '../../hooks/ScenarioWorld';
import { getData } from '../../hooks/utils';
import {
  verifyDeviceStatus,
  verifyOptions,
  verifyViewScreenSize,
} from '../../playwright-support/app-specific/element-verification';
import { verifyElementState } from '../../playwright-support/generic/element-verification';
import { waitFor } from '../../playwright-support/generic/element-wait';
import { Screen, Status } from '../../utils/types';
import { arrayContainsAll } from '../generic/utils';
import { verifyHeaderData, verifySettings, verifyStats, verifyView } from './workflow/workflow';
import {
  getDefaultHeaderData,
  getDefaultSettingsData,
  getDefaultStatsData,
  getDefaultViewData,
} from './workflow/workflow.data';

Then(
  /^the "([^"]*)" should( not)? be in (Full|Normal) size$/,
  async function (this: ScenarioWorld, selectorName: string, negate: string, screenSize: Screen) {
    const targetSelector = this.selectorMap.getSelector(this.currentPageName, selectorName);
    const verifyMethod = async () => {
      await verifyViewScreenSize(this.currentPage, targetSelector, screenSize, !!negate);
    };
    await waitFor(verifyMethod);
  }
);

Then(
  /^the "([^"]*)" should( not)? be turned (On|Off)$/,
  async function (this: ScenarioWorld, selectorName: string, negate: string, status: Status) {
    const targetSelector = this.selectorMap.getSelector(this.currentPageName, selectorName);
    const verifyMethod = async () => {
      await verifyDeviceStatus(this.currentPage, targetSelector, status, !!negate);
    };
    await waitFor(verifyMethod);
  }
);

Then(
  /^the "([^"]*)" should( not)? contain "([^"]*)" options$/,
  async function (this: ScenarioWorld, selectorName: string, negate: string, options: string) {
    const targetSelector = this.selectorMap.getSelector(this.currentPageName, selectorName);
    const verifyMethod = async () => {
      await verifyOptions(this.currentPage, targetSelector, options.split(','), !!negate);
    };
    await waitFor(verifyMethod);
  }
);

Then(
  /^the "([^"]*)" feature should be turned (On|Off)$/,
  async function (this: ScenarioWorld, selectorName: string, status: Status) {
    const targetSelector = this.selectorMap.getSelector(this.currentPageName, selectorName);
    const negate = status === 'Off';

    const verifyMethod = async () => {
      await verifyElementState(this.currentPage, targetSelector, 'checked', negate);
    };
    await waitFor(verifyMethod);
  }
);

Then(
  /^the( "([0-9]+th|[0-9]+st|[0-9]+nd|[0-9]+rd)")? "(camera view|screen view|local file view|remote file view)" should be displayed with default values$/,
  async function (this: ScenarioWorld, elementPosition: string, viewName: string) {
    const appName = getData(this, 'App');
    const expectedData = getDefaultViewData(`${appName} ${viewName}`);
    await verifyView(this, elementPosition, viewName, expectedData);
  }
);

Then(
  /^the( "([0-9]+th|[0-9]+st|[0-9]+nd|[0-9]+rd)")? "(camera view|screen view|local file view|remote file view)" should be displayed with (following|only) values$/,
  async function (this: ScenarioWorld, elementPosition: string, viewName: string, type: string, dataTable: DataTable) {
    const appName = getData(this, 'App');
    const defaultExpectedData = getDefaultViewData(`${appName} ${viewName}`);
    let expectedData = dataTable.rowsHash();

    if (!arrayContainsAll(Object.keys(defaultExpectedData), Object.keys(expectedData))) {
      throw Error(`Invalid parameter/key name - ${Object.keys(expectedData)}`);
    }

    if (type === 'following') {
      expectedData = { ...defaultExpectedData, ...dataTable.rowsHash() };
    }

    await verifyView(this, elementPosition, viewName, expectedData);
  }
);

Then(
  /^the "(preview header|waiting room header|streaming header)" should be displayed with default values$/,
  async function (this: ScenarioWorld, headerName: string) {
    const appName = getData(this, 'App');
    const expectedData = getDefaultHeaderData(`${appName} ${headerName}`);
    await verifyHeaderData(this, expectedData);
  }
);

Then(
  /^the "(preview header|waiting room header|streaming header)" should be displayed with (following|only) values$/,
  async function (this: ScenarioWorld, headerName: string, type: string, dataTable: DataTable) {
    const appName = getData(this, 'App');
    const defaultExpectedData = getDefaultHeaderData(`${appName} ${headerName}`);
    let expectedData = dataTable.rowsHash();

    if (!arrayContainsAll(Object.keys(defaultExpectedData), Object.keys(expectedData))) {
      throw Error(`Invalid parameter/key name - ${Object.keys(expectedData)}`);
    }

    if (type === 'following') {
      expectedData = { ...defaultExpectedData, ...dataTable.rowsHash() };
    }

    await verifyHeaderData(this, expectedData);
  }
);

Then(
  /^the( "([0-9]+th|[0-9]+st|[0-9]+nd|[0-9]+rd)")? "(camera view|screen view|local file view|remote file view)" setting should be displayed with default values$/,
  async function (this: ScenarioWorld, elementPosition: string, viewName: string) {
    const appName = getData(this, 'App');
    const expectedData = getDefaultSettingsData(`${appName} ${viewName}`);
    await verifySettings(this, elementPosition, viewName, expectedData);
  }
);

Then(
  /^the( "([0-9]+th|[0-9]+st|[0-9]+nd|[0-9]+rd)")? "(camera view|screen view|local file view|remote file view)" setting should be displayed with (following|only) values$/,
  async function (this: ScenarioWorld, elementPosition: string, viewName: string, type: string, dataTable: DataTable) {
    const appName = getData(this, 'App');
    const defaultExpectedData = getDefaultSettingsData(`${appName} ${viewName}`);
    let expectedData = dataTable.rowsHash();

    if (!arrayContainsAll(Object.keys(defaultExpectedData), Object.keys(expectedData))) {
      throw Error(`Invalid parameter/key name - ${Object.keys(expectedData)}`);
    }

    if (type === 'following') {
      expectedData = { ...defaultExpectedData, ...dataTable.rowsHash() };
    }

    await verifySettings(this, elementPosition, viewName, expectedData);
  }
);

Then(
  /^the( "([0-9]+th|[0-9]+st|[0-9]+nd|[0-9]+rd)")? "(camera view|screen view|local file view|remote file view)" stream stats should be displayed with default values$/,
  async function (this: ScenarioWorld, elementPosition: string, viewName: string) {
    const appName = getData(this, 'App');
    const expectedData = getDefaultStatsData(`${appName} ${viewName}`);
    await verifyStats(this, elementPosition, appName, viewName, expectedData);
  }
);

Then(
  /^the( "([0-9]+th|[0-9]+st|[0-9]+nd|[0-9]+rd)")? "(camera view|screen view|local file view|remote file view)" stream stats should be displayed with (following|only) values$/,
  async function (this: ScenarioWorld, elementPosition: string, viewName: string, type: string, dataTable: DataTable) {
    const appName = getData(this, 'App');
    const defaultExpectedData = getDefaultStatsData(`${appName} ${viewName}`);
    let expectedData = dataTable.rowsHash();

    if (!arrayContainsAll(Object.keys(defaultExpectedData), Object.keys(expectedData))) {
      throw Error(`Invalid parameter/key name - ${Object.keys(expectedData)}`);
    }

    if (type === 'following') {
      expectedData = { ...defaultExpectedData, ...dataTable.rowsHash() };
    }

    await verifyStats(this, elementPosition, appName, viewName, expectedData);
  }
);
