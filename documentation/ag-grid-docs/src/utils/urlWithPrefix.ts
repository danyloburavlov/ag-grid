import type { Framework } from '@ag-grid-types';
import { SITE_BASE_URL } from '@constants';
import { getFrameworkPath } from '@features/docs/utils/urlPaths';

import { pathJoin } from './pathJoin';

export const urlWithPrefix = ({
    url = '',
    framework,
    siteBaseUrl = SITE_BASE_URL,
}: {
    url: string;
    framework?: Framework;
    siteBaseUrl?: string;
}): string => {
    let path = url;
    if (url.startsWith('./')) {
        const frameworkPath = getFrameworkPath(framework!);
        path = pathJoin('/', siteBaseUrl, frameworkPath, url.slice('./'.length));
    } else if (url.startsWith('/')) {
        path = pathJoin('/', siteBaseUrl, url);
    } else if (!url.startsWith('#') && !url.startsWith('http') && !url.startsWith('mailto')) {
        // eslint-disable-next-line no-console
        console.warn(`Invalid url: ${url}`);
    }

    return path;
};
