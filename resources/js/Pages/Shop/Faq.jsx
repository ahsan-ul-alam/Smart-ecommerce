import ShopLayout from '../../Layouts/ShopLayout';
import { Card, CardBody } from '../../Components/UI/Card';

export default function Faq({ faqs }) {
    return (
        <ShopLayout>
            <div className="max-w-3xl mx-auto px-6 py-12">
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Frequently Asked Questions</h1>
                <p className="text-slate-500 mb-8">Quick answers about ordering, delivery, and returns.</p>

                <div className="space-y-4">
                    {faqs.map((faq) => (
                        <Card key={faq.id}>
                            <CardBody>
                                <h2 className="font-semibold text-slate-800 dark:text-white">{faq.question}</h2>
                                <p className="text-sm text-slate-600 dark:text-slate-300 mt-2 whitespace-pre-wrap">{faq.answer}</p>
                            </CardBody>
                        </Card>
                    ))}
                    {!faqs.length && (
                        <p className="text-center text-slate-400 py-12">No FAQs published yet.</p>
                    )}
                </div>
            </div>
        </ShopLayout>
    );
}
