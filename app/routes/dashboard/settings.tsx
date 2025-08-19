import { toast } from "sonner";
import PageLayout from "../pageLayout";
import { useEffect, useState } from "react";
import { useIsMobile } from "~/hooks/use-mobile";
import PrivateRoute from "~/context/PrivateRoute";

import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { Switch } from "~/components/ui/switch";
import { Separator } from "~/components/ui/separator";

import { fetchSettingsByKeys, upsertSettingValue, unwrapSettingValue } from "~/utils/data";

export function meta() {
    return [{ title: "Instellingen" }];
}

const KEYS = {
    published: "leiding.published",
    message: "leiding.published-msg",
} as const;

export default function SettingsPage() {
    const isMobile = useIsMobile();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [form, setForm] = useState({
        published: true,
        message: "",
    });
    const [initial, setInitial] = useState(form);

    useEffect(() => {
        let cancel = false;
        (async () => {
            try {
                setLoading(true);
                const rows = await fetchSettingsByKeys([KEYS.published, KEYS.message]);
                const map = Object.fromEntries(rows.map((r) => [r.key, r]));
                const rawPublished = unwrapSettingValue(map[KEYS.published]);
                const published = typeof rawPublished === "boolean" ? rawPublished : Boolean(rawPublished);
                const message = (unwrapSettingValue(map[KEYS.message]) as string) ?? "";
                const next = { published, message };
                if (!cancel) {
                    setForm(next);
                    setInitial(next);
                }
            } catch (e) {
                console.error(e);
                toast.error("Kon instellingen niet laden.");
            } finally {
                if (!cancel) setLoading(false);
            }
        })();
        return () => {
            cancel = true;
        };
    }, []);

    const isDirty = form.published !== initial.published || form.message !== initial.message;

    async function handleSave() {
        try {
            setSaving(true);
            await Promise.all([
                upsertSettingValue(KEYS.published, form.published, "boolean", true),
                upsertSettingValue(KEYS.message, form.message, "string", true),
            ]);
            setInitial(form);
            toast.success("Instellingen opgeslagen");
        } catch (e) {
            console.error(e);
            toast.error("Opslaan mislukt");
        } finally {
            setSaving(false);
        }
    }

    const settingItemStyle = `flex flex-col gap-4 py-4 md:flex-row md:gap-0`;

    return (
        <PrivateRoute>
            <PageLayout>
                <div className="flex flex-col gap-6 pb-20">
                    <header className="flex flex-col gap-3 md:justify-between md:items-center md:flex-row">
                        <h3 className="text-2xl font-semibold tracking-tight">Instellingen</h3>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" disabled={!isDirty || saving} onClick={() => setForm(initial)} className={isMobile ? "w-[50%]" : undefined}>
                                Annuleren
                            </Button>
                            <Button disabled={!isDirty || saving} onClick={handleSave} className={isMobile ? "w-[50%]" : undefined}>
                                {saving ? "Opslaan…" : "Opslaan"}
                            </Button>
                        </div>
                    </header>

                    <div className="lg:col-span-2 space-y-8">
                        {/* Leiding settings group */}
                        <div className="space-y-4">
                            <div className="border-b pb-4">
                                <h2 className="text-xl font-semibold">Leiding</h2>
                                <p className="text-sm text-muted-foreground">Zichtbaarheid en bericht wanneer verborgen.</p>
                            </div>

                            <div className={settingItemStyle}>
                                <div className="md:basis-1/3">
                                    <p className="font-semibold">Leiding zichtbaarheid</p>
                                </div>

                                <div className="flex items-center gap-2 md:basis-2/3">
                                    <Switch
                                        id="leiding-published"
                                        checked={form.published}
                                        onCheckedChange={(v) => setForm((f) => ({ ...f, published: v }))}
                                        disabled={loading || saving}
                                    />
                                    <span className="text-right">{form.published ? "Zichtbaar" : "Verborgen"}</span>
                                </div>
                            </div>

                            <Separator />

                            <div className={settingItemStyle}>
                                <div className="md:basis-1/3">
                                    <p className="font-semibold">Onzichtbaar Melding</p>
                                </div>

                                <Input
                                    placeholder="Bijv. Benieuwd om te zien wie in welke groep zit? Kom binnenkort terug!"
                                    value={form.message}
                                    onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                                    disabled={loading || saving || form.published}
                                    className="md:basis-2/3"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </PageLayout>
        </PrivateRoute>
    );
}