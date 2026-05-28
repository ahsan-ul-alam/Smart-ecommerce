import { useForm } from '@inertiajs/react';
import ShopLayout from '../../Layouts/ShopLayout';
import Button from '../../Components/UI/Button';
import Input from '../../Components/UI/Input';
import FlashMessage from '../../Components/UI/FlashMessage';
import { Card, CardBody, CardHeader } from '../../Components/UI/Card';

export default function NewsletterUnsubscribe({ email: initialEmail = '' }) {
    const { data, setData, post, processing, errors } = useForm({ email: initialEmail });

    const submit = (e) => {
        e.preventDefault();
        post('/newsletter/unsubscribe', { preserveScroll: true });
    };

    return (
        <ShopLayout>
            <FlashMessage />
            <div className="max-w-md mx-auto px-6 py-16">
                <Card>
                    <CardHeader title="Unsubscribe from newsletter" subtitle="You will no longer receive promotional emails from us." />
                    <CardBody>
                        <form onSubmit={submit} className="space-y-4">
                            <Input
                                label="Email address"
                                type="email"
                                required
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                error={errors.email}
                            />
                            <Button type="submit" loading={processing} variant="secondary" className="w-full">
                                Unsubscribe
                            </Button>
                        </form>
                    </CardBody>
                </Card>
            </div>
        </ShopLayout>
    );
}
