import { useForm } from '@inertiajs/react';
import { Mail, Phone, MapPin } from 'lucide-react';
import ShopLayout from '../../Layouts/ShopLayout';
import ShopPageHeader from '../../Components/Shop/ShopPageHeader';
import Button from '../../Components/UI/Button';
import Input from '../../Components/UI/Input';
import Textarea from '../../Components/UI/Textarea';
import FlashMessage from '../../Components/UI/FlashMessage';
import { Card, CardBody, CardHeader } from '../../Components/UI/Card';

export default function Contact({ store }) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post('/shop/contact');
    };

    return (
        <ShopLayout>
            <FlashMessage />
            <ShopPageHeader
                title="Contact us"
                description="Questions about orders, products, or partnerships? We're here to help."
                breadcrumbs={[{ label: 'Contact' }]}
            />

                <div className="grid md:grid-cols-3 gap-8 max-w-4xl">
                    <div className="space-y-4 text-sm text-slate-600 dark:text-slate-400">
                        {store.email && (
                            <p className="flex items-center gap-2">
                                <Mail size={16} className="text-teal-700" />
                                <a href={`mailto:${store.email}`} className="hover:text-teal-700">{store.email}</a>
                            </p>
                        )}
                        {store.phone && (
                            <p className="flex items-center gap-2">
                                <Phone size={16} className="text-teal-700" />
                                {store.phone}
                            </p>
                        )}
                        {store.address && (
                            <p className="flex items-start gap-2">
                                <MapPin size={16} className="text-teal-700 shrink-0 mt-0.5" />
                                {store.address}
                            </p>
                        )}
                    </div>

                    <Card className="md:col-span-2">
                        <CardHeader title="Send a message" />
                        <CardBody>
                            <form onSubmit={submit} className="space-y-4">
                                <div className="grid sm:grid-cols-2 gap-4">
                                    <Input label="Name" value={data.name} onChange={(e) => setData('name', e.target.value)} error={errors.name} required />
                                    <Input label="Email" type="email" value={data.email} onChange={(e) => setData('email', e.target.value)} error={errors.email} required />
                                </div>
                                <Input label="Phone (optional)" value={data.phone} onChange={(e) => setData('phone', e.target.value)} error={errors.phone} />
                                <Input label="Subject" value={data.subject} onChange={(e) => setData('subject', e.target.value)} error={errors.subject} required />
                                <Textarea label="Message" rows={5} value={data.message} onChange={(e) => setData('message', e.target.value)} error={errors.message} required />
                                <Button type="submit" loading={processing}>Send message</Button>
                            </form>
                        </CardBody>
                    </Card>
                </div>
        </ShopLayout>
    );
}
