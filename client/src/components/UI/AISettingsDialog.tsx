import React, { useState, useCallback, useRef, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { useCvEditStore } from '../../Store';

interface AISettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  focusJobDescription?: boolean;
}

const AISettingsDialog: React.FC<AISettingsDialogProps> = ({
  isOpen,
  onClose,
  focusJobDescription = false,
}) => {
  const jobDescription = useCvEditStore((s) => s.jobDescription);
  const companyName = useCvEditStore((s) => s.companyName);
  const setJobDescription = useCvEditStore((s) => s.setJobDescription);
  const setCompanyName = useCvEditStore((s) => s.setCompanyName);

  const [companyNameCurrent, setCompanyNameCurrent] = useState(companyName ?? '');
  const [jobDescriptionCurrent, setJobDescriptionCurrent] = useState(jobDescription ?? '');

  const jobDescriptionRef = useRef<HTMLTextAreaElement>(null);

  const handleSave = useCallback(() => {
    setJobDescription(jobDescriptionCurrent);
    setCompanyName(companyNameCurrent);
    onClose();
  }, [companyNameCurrent, jobDescriptionCurrent, onClose, setCompanyName, setJobDescription]);

  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (!open) {
        onClose();
        setCompanyNameCurrent(companyName ?? '');
        setJobDescriptionCurrent(jobDescription ?? '');
      }

    },
    [onClose, companyName, jobDescription],
  );

  useEffect(() => {
    if (isOpen) {
      setCompanyNameCurrent(companyName ?? '');
      setJobDescriptionCurrent(jobDescription ?? '');
    }
  }, [isOpen, companyName, jobDescription]);

  return (
    <Dialog.Root open={isOpen} onOpenChange={handleOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />

        {/* Desktop: centered modal / Mobile: bottom sheet */}
        <Dialog.Content
          onOpenAutoFocus={(e) => {
            if (focusJobDescription) {
              e.preventDefault();

              const jobDescriptionInput = jobDescriptionRef.current;
              if (jobDescriptionInput) {
                const length = jobDescriptionInput.value.length;

                jobDescriptionInput.focus();
                jobDescriptionInput.setSelectionRange(length, length);
                jobDescriptionInput.scrollTop = jobDescriptionInput.scrollHeight;
              }
            }
          }}
          className={[
            // base
            'fixed z-50 w-full bg-white focus:outline-none',
            // desktop
            'sm:left-1/2 sm:top-1/2 sm:max-w-lg sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-2xl',
            // mobile bottom-sheet
            'max-sm:bottom-0 max-sm:left-0 max-sm:right-0 max-sm:rounded-t-2xl max-sm:rounded-b-none',
            // shadow
            'shadow-2xl',
            // radix animations
            'data-[state=open]:animate-in data-[state=closed]:animate-out',
            'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
            'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
            'sm:data-[state=closed]:slide-out-to-left-1/2 sm:data-[state=closed]:slide-out-to-top-1/2',
            'sm:data-[state=open]:slide-in-from-left-1/2 sm:data-[state=open]:slide-in-from-top-1/2',
            'max-sm:data-[state=open]:slide-in-from-bottom-full max-sm:data-[state=closed]:slide-out-to-bottom-full',
          ].join(' ')}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
            <Dialog.Title className="text-base font-semibold text-gray-900">
              AI Settings
            </Dialog.Title>
            <Dialog.Close asChild>
              <button
                className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors cursor-pointer"
                aria-label="Close dialog"
              >
                <X className="h-4 w-4" />
              </button>
            </Dialog.Close>
          </div>

          {/* Body */}
          <div className="px-6 py-5 space-y-5">
            {/* Section: CV Settings */}
            <div className="space-y-4">
              <div className="pb-2 border-b border-gray-100">
                <span className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">
                  CV Settings
                </span>
              </div>

              {/* Company Name */}
              <div className="space-y-1.5">
                <label
                  htmlFor="ai-company-name"
                  className="block text-sm font-medium text-gray-700"
                >
                  Company Name
                </label>
                <input
                  id="ai-company-name"
                  type="text"
                  value={companyNameCurrent}
                  onChange={(e) => setCompanyNameCurrent(e.target.value)}
                  placeholder="e.g. Acme Corp"
                  className="w-full rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 outline-none transition-shadow focus:border-blue-400 focus:ring-1 focus:ring-blue-100"
                />
              </div>

              {/* Job Description */}
              <div className="space-y-1.5">
                <label
                  htmlFor="ai-job-description"
                  className="block text-sm font-medium text-gray-700"
                >
                  Job Description
                </label>
                <textarea
                  ref={jobDescriptionRef}
                  id="ai-job-description"
                  value={jobDescriptionCurrent}
                  onChange={(e) => setJobDescriptionCurrent(e.target.value)}
                  placeholder="Paste the job description here…"
                  rows={4}
                  className="w-full resize-y rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 outline-none transition-shadow focus:border-blue-400 focus:ring-1 focus:ring-blue-100 min-h-24"
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-2 border-t border-gray-100 px-6 py-4">
            <Dialog.Close asChild>
              <button className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer">
                Cancel
              </button>
            </Dialog.Close>
            <button
              onClick={handleSave}
              className="px-5 py-2 text-sm font-semibold text-white bg-[#237bff] hover:bg-[#1a5fcc] rounded-lg transition-colors cursor-pointer"
            >
              Save
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default AISettingsDialog;
