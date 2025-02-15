import { ICON_MAP } from '@components/icon/Icon';
import { defineCollection, z } from 'astro:content';

const docs = defineCollection({
    schema: z.object({
        title: z.string(),
        description: z.string().optional(),
        enterprise: z.boolean().optional(),
        /**
         * Hide right hand side menu
         */
        hideSideMenu: z.boolean().optional(),
        /**
         * Hide left hand page menu
         */
        hidePageMenu: z.boolean().optional(),
    }),
});

const menuItemBase = {
    title: z.string(),
    /**
     * Path to website docs within `src/content/docs`
     */
    path: z.string().optional(),
    /**
     * External link url
     */
    url: z.string().url().optional(),
    /**
     * Open external link url in a new window
     */
    newWindow: z.boolean().optional(),
    icon: z.enum(Object.keys(ICON_MAP) as any).optional(),
    // TODO: Add frameworks back
    // frameworks: z.array(z.enum(FRAMEWORKS as any)).optional(),
    frameworks: z.array(z.string()).optional(),

    isEnterprise: z.boolean().optional(),
};

const level3MenuItem = z.object({
    ...menuItemBase,
    items: z.array(z.object(menuItemBase)).optional(),
});

const level2MenuItem = z.object({
    ...menuItemBase,
    items: z.array(level3MenuItem).optional(),
});

const level1MenuItem = z.object({
    ...menuItemBase,
    items: z.array(level2MenuItem).optional(),
});

const sectionItem = z.object({
    title: z.string().optional(),
    excludeFromFeatures: z.boolean().optional(),
    items: z.array(level1MenuItem).optional(),

    // What's new parameters
    type: z.enum(['whats-new']).optional(),
    path: z.string().optional(),
});

const menu = defineCollection({
    type: 'data',
    schema: z.object({
        header: z.object({
            items: z.array(level1MenuItem),
        }),
        api: z.object({
            sections: z.array(sectionItem),
        }),
        main: z.object({
            sections: z.array(sectionItem),
        }),
    }),
});

const matrixTable = defineCollection({
    type: 'data',
    schema: z.array(z.record(z.string(), z.any())),
});

export const collections = {
    docs,
    menu,
    'matrix-table': matrixTable,
};
