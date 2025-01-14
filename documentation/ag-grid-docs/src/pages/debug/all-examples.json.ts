import { getIsImplemented } from '@constants';
import { getDocsExamplePages } from '@features/docs/utils/pageData';
import { getCollection } from 'astro:content';

export async function getAllExamples() {
    const pages = await getCollection('docs');
    const examples = await getDocsExamplePages({
        pages,
    });

    return examples.filter(({ params }) => {
        return getIsImplemented(params);
    });
}

export async function GET() {
   

    const examples = await getAllExamples();

    const cleanerExamples = examples.map((example) => {
        return {
            pageName: example.params.pageName,
            exampleName: example.params.exampleName,
            importType: example.params.importType,
            internalFramework: example.params.internalFramework,
            isSupported: example.params.isSupported,
        };
    });

    return new Response(JSON.stringify(cleanerExamples), {
        status: 200,
        headers: {
            'Content-Type': 'application/json',
        },
    });
}
