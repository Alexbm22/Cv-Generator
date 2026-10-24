import React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAiUsageNoticeStore } from '../../Store/useAiUsageNoticeStore';
import type { AiUsageNotice } from '../../interfaces/ai';
import { routes } from '../../router/routes';

interface Cta {
    label: string;
    path: string;
}

interface NoticeCopy {
    title: string;
    body: string;
    cta?: Cta;
}

const formatResetTime = (resetsAt: string): string =>
    new Date(resetsAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });

const buildCopy = (notice: AiUsageNotice): NoticeCopy => {
    const { feature, userType, level, remaining, period, resetsAt } = notice;
    const resetText = resetsAt ? ` The limit resets at ${formatResetTime(resetsAt)}.` : '';
    const plansCta: Cta = { label: 'View plans', path: routes.plans.path };
    const upsell = userType === 'free'
        ? 'Buy export credits or subscribe for a better AI model and more AI sessions.'
        : 'Subscribe for more AI sessions and a better AI model.';

    if (userType === 'guest') {
        return feature === 'cv_translate'
            ? {
                title: 'Create an account to translate',
                body: 'Translation is available for registered accounts.',
                cta: { label: 'Create account', path: routes.signup.path },
            }
            : {
                title: 'Free AI edit used up',
                body: 'Create an account to keep using AI edits.',
                cta: { label: 'Create account', path: routes.signup.path },
            };
    }

    if (userType === 'pro') {
        return level === 'limit_reached'
            ? { title: 'Daily AI limit reached', body: `Your AI limit is used up for today.${resetText}` }
            : { title: `${remaining} left today`, body: `You are close to your daily AI limit.${resetText}` };
    }

    if (level === 'near_limit') {
        const scope = period === 'daily' ? ' today' : '';
        return {
            title: `${remaining} translation${remaining === 1 ? '' : 's'} left${scope}`,
            body: upsell,
            cta: plansCta,
        };
    }

    const title = feature === 'cv_translate' && period === 'lifetime'
        ? 'Free translations used up'
        : 'Daily AI limit reached';
    return { title, body: `${upsell}${resetText}`, cta: plansCta };
};

const AiUsageNoticeDialog: React.FC = () => {
    const notice = useAiUsageNoticeStore((s) => s.notice);
    const dismiss = useAiUsageNoticeStore((s) => s.dismiss);
    const navigate = useNavigate();

    const copy = notice ? buildCopy(notice) : null;

    const handleCta = () => {
        if (!copy?.cta) return;
        dismiss();
        navigate(copy.cta.path);
    };

    return (
        <Dialog.Root open={notice !== null} onOpenChange={(open) => !open && dismiss()}>
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 z-[70] bg-black/40 backdrop-blur-xs" />
                <Dialog.Content className="fixed left-1/2 top-1/2 z-[70] w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white shadow-2xl focus:outline-none">
                    <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
                        <Dialog.Title className="text-lg font-semibold text-gray-900">
                            {copy?.title}
                        </Dialog.Title>
                        <Dialog.Close asChild>
                            <button
                                className="rounded-full cursor-pointer p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                aria-label="Close dialog"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </Dialog.Close>
                    </div>

                    <Dialog.Description className="px-6 py-5 text-sm text-gray-600">
                        {copy?.body}
                    </Dialog.Description>

                    <div className="flex justify-end gap-3 border-t border-gray-100 px-6 py-4">
                        <Dialog.Close asChild>
                            <button className="px-4 py-2 text-sm font-bold text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer">
                                Not now
                            </button>
                        </Dialog.Close>
                        {copy?.cta && (
                            <button
                                onClick={handleCta}
                                className="px-5 py-2 text-sm font-semibold text-white bg-[#237bff] hover:bg-[#1a5fcc] rounded-lg transition-colors cursor-pointer"
                            >
                                {copy.cta.label}
                            </button>
                        )}
                    </div>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
};

export default AiUsageNoticeDialog;
