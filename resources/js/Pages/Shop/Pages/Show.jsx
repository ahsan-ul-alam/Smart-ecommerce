import ShopLayout from '../../../Layouts/ShopLayout';
import { Card, CardBody } from '../../../Components/UI/Card';

export default function PageShow({ page }) {
    return (
        <ShopLayout>
            <div className="max-w-3xl mx-auto px-4 py-10">
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">{page.title}</h1>
                <Card>
                    <CardBody>
                        <div
                            className="prose prose-slate dark:prose-invert max-w-none whitespace-pre-wrap"
                            dangerouslySetInnerHTML={{ __html: page.content?.replace(/\n/g, '<br />') ?? '' }}
                        />
                    </CardBody>
                </Card>
            </div>
        </ShopLayout>
    );
}
