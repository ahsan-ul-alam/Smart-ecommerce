import { useState } from 'react';
import PanelTabs from './PanelTabs';
import PropertyPanel from './PropertyPanel';
import ThemeSettings from './ThemeSettings';

export default function InspectorPanel({ catalog, pageSettings }) {
    const [tab, setTab] = useState('content');

    return (
        <div className="flex flex-col h-full min-h-0">
            <PanelTabs
                tabs={[
                    { id: 'content', label: 'Content' },
                    { id: 'style', label: 'Style' },
                    { id: 'page', label: 'Page' },
                ]}
                active={tab}
                onChange={setTab}
            />
            <div className="flex-1 overflow-y-auto min-h-0">
                {tab === 'content' && <PropertyPanel catalog={catalog} mode="content" />}
                {tab === 'style' && (
                    <>
                        <PropertyPanel catalog={catalog} mode="style" />
                        <ThemeSettings />
                    </>
                )}
                {tab === 'page' && pageSettings}
            </div>
        </div>
    );
}
