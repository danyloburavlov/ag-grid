import * as fs from 'fs';
import { JSDOM } from 'jsdom';

import * as mockCanvas from '../src/chart/test/mock-canvas';
import * as examples from '../src/chart/test/examples';
import { AgChart } from '../src/chart/agChartV2';
import { AgChartOptions } from '../src/chart/agChartOptions';
import { Chart } from '../src/chart/chart';

const galleryJsonPath = `${__dirname}/../../../grid-packages/ag-grid-docs/documentation/doc-pages/charts-overview/gallery.json`;
const outputPath = `${__dirname}/../../../grid-packages/ag-grid-docs/documentation/src/components/chart-gallery/thumbnails`;
const galleryExamplesPath = `${__dirname}/../../../grid-packages/ag-grid-docs/documentation/doc-pages/charts-overview/examples`;
const galleryMdPath = `${__dirname}/../../../grid-packages/ag-grid-docs/documentation/doc-pages/charts-overview/_gallery.md`;
const menuJsonPath = `${__dirname}/../../../grid-packages/ag-grid-docs/documentation/doc-pages/licensing/menu.json`;
const indexJsPath = `${__dirname}/../../../grid-packages/ag-grid-docs/documentation/src/components/chart-gallery/thumbnails/index.js`;

const loadJson = (filename) => {
    return JSON.parse(fs.readFileSync(filename).toString());
};

const toKebabCase = (name) => {
    return name
        .replace(/ \w/g, (v) => `-${v.trim().toLowerCase()}`)
        .replace(/[^\w]/g, '-')
        .toLowerCase();
};

const toUpperCamelCase = (name) =>
    (' ' + name).toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (_, chr) => chr.toUpperCase());

const galleryOpts = loadJson(galleryJsonPath);
const examplesToGenerate: string[] = [];

for (const group of Object.values(galleryOpts)) {
    for (const { example } of Object.values(group as Record<string, { example?: string }>)) {
        if (example) {
            examplesToGenerate.push(example);
        }
    }
}

const genThumbnails = async () => {
    const width = 900;
    const height = 700;
    const optionOverrides: Partial<AgChartOptions> = {
        autoSize: false,
        width,
        height,
        padding: {
            top: 20,
            left: 30,
            right: 30,
            bottom: 40,
        },
    };

    for (const thumbnail of examplesToGenerate) {
        const example = examples.DOCS_EXAMPLES[thumbnail];
        if (example == null) {
            console.error(`Didn't find example for ['${thumbnail}']!`);
            process.exitCode = 5;
            continue;
        }

        console.log(`Generating thumbnail for ['${thumbnail}']...`);

        const {
            window,
            window: { document, HTMLElement, navigator },
        } = new JSDOM('<html><body></body></html>');
        const globalNsValues = { window, document, HTMLElement, navigator };
        Object.assign(global, globalNsValues);

        const mockCtx = mockCanvas.setup({ width, height });

        const options = { ...example, ...optionOverrides };
        const chartProxy = AgChart.create(options);
        const chart: Chart = (chartProxy as any).chart;
        await chart.waitForUpdate(5_000);

        fs.writeFileSync(`${outputPath}/${thumbnail}.png`, mockCtx.ctx.nodeCanvas?.toBuffer());

        chart.destroy();
        mockCanvas.teardown(mockCtx);

        Object.keys(globalNsValues).forEach((k) => delete global[k]);
    }
};

const updateGalleryMd = async () => {
    console.log('Updating _gallery.md...');

    const moduleName = __filename.split('/').pop();
    const fileContent = `
---
title: "AG Charts Gallery"
comment: "This page is auto-generated by ${moduleName} to allow the chart gallery examples to be generated. It is ignored by the website."
---
`
        .trim()
        .split('\n')
        .concat('');

    for (const example of examplesToGenerate) {
        let type = 'generated';
        if (fs.existsSync(`${galleryExamplesPath}/${example}/provided`)) {
            type = 'mixed';
        }

        fileContent.push(
            `<chart-example name='${example}' type='${type}' options='{ "exampleHeight": "60vh" }'></chart-example>`
        );
    }

    fs.writeFileSync(galleryMdPath, fileContent.join('\n'));
};

function findItemWithUrl(items: any, url: string) {
    for (const item of items) {
        if (item.url === url) {
            return item;
        }
    }

    for (let i = 0; i < items.length; i++) {
        const children = items[i].items;

        if (children) {
            const item = findItemWithUrl(children, url);

            if (item) {
                return item;
            }
        }
    }

    return null;
}

const updateMenu = async () => {
    console.log('Updating menu.json...');

    const rootPath = `/charts-overview/`;
    const menu = loadJson(menuJsonPath);
    const galleryObject = findItemWithUrl(menu, rootPath);

    galleryObject.items = Object.keys(galleryOpts).map((category) => ({
        title: category,
        url: rootPath + `#${toKebabCase(category)}`,
        disableActive: true,
        // by including children but hiding them, the menu will still expand correctly when those children pages are open
        hideChildren: true,
        items: Object.keys(galleryOpts[category])
            .filter((name) => !name.startsWith('_'))
            .map((name) => ({
                title: name,
                url: `${rootPath}gallery/${toKebabCase(name)}/`,
            })),
    }));

    fs.writeFileSync(menuJsonPath, JSON.stringify(menu, null, 2));
};

const updateThumbnailIndexJs = async () => {
    console.log('Updating index.js...');

    const imports: string[] = [];
    const thumbnails: string[] = [];

    for (const example of examplesToGenerate) {
        const importName = `thumbnail${toUpperCamelCase(example)}`;
        imports.push(`import ${importName} from './${example}.png';`);
        thumbnails.push(`    '${example}': ${importName},`);
    }

    const output = [...imports, '', 'const thumbnails = {', ...thumbnails, '};', '', 'export default thumbnails;'];

    fs.writeFileSync(indexJsPath, output.join('\n'));
};

Promise.all([genThumbnails(), updateGalleryMd(), updateMenu(), updateThumbnailIndexJs()])
    .then(() => {
        process.exit();
    })
    .catch((e) => {
        console.error(e);
        process.exit(10);
    });
