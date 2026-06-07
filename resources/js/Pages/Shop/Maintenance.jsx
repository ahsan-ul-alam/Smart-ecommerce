import GuestLayout from '../../Layouts/GuestLayout';
import { Card, CardBody } from '../../Components/UI/Card';

export default function Maintenance({ message }) {
    return (
        <GuestLayout>
            <Card className="w-full max-w-md text-center">
                <CardBody className="py-12">
                    <p className="text-5xl mb-4">🔧</p>
                    <h1 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Under Maintenance</h1>
                    <p className="text-slate-500 text-sm">{message}</p>
                    <p className="text-xs text-slate-400 mt-6">
                        <a href="/login?portal=admin" className="text-primary hover:underline">Admin login</a>
                    </p>
                </CardBody>
            </Card>
        </GuestLayout>
    );
}
