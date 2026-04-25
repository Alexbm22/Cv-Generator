import { Sparkles } from 'lucide-react';

const AiEditor: React.FC<{isShowingPreview: boolean}> = ({isShowingPreview}) => {
    return (
        <div  
            className="transition-all duration-1000 bg-[#f3fbff] w-full shadow-lg z-0.5 overflow-y-auto"
            style={isShowingPreview ? {flexBasis: '56.25%'} : {flexBasis: '100%'} }>
            <div className="flex flex-col items-center justify-center h-full w-full gap-4 text-center px-8">
                <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-[#f3eeff] text-[#7c3aed]">
                    <Sparkles size={28} strokeWidth={1.5} />
                </div>
                <div className="flex flex-col gap-1.5">
                    <h2 className="text-lg font-semibold text-gray-800 tracking-tight">AI Editor</h2>
                    <p className="text-sm text-gray-400 max-w-xs leading-relaxed">
                        Create and enhance your CV effortlessly with our upcoming AI Editor. Coming soon.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AiEditor;
