import { Download, Eye, FileText } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface FilePreviewDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    document: {
        id: number;
        file_name: string;
        mime_type: string;
        file_size: number;
    } | null;
    downloadUrl: string;
}

function formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function FilePreviewDialog({ open, onOpenChange, document, downloadUrl }: FilePreviewDialogProps) {
    if (!document) {
        return null;
    }

    const isImage = document.mime_type.startsWith('image/');
    const isPdf = document.mime_type === 'application/pdf';
    const previewUrl = `${downloadUrl}${downloadUrl.includes('?') ? '&' : '?'}preview=1`;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className={isImage || isPdf ? 'sm:max-w-3xl' : 'sm:max-w-md'}>
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Eye className="h-4 w-4" />
                        {document.file_name}
                    </DialogTitle>
                </DialogHeader>

                <div className="mt-2">
                    {isImage ? (
                        <img
                            src={previewUrl}
                            alt={document.file_name}
                            className="max-h-[60vh] w-full object-contain"
                        />
                    ) : isPdf ? (
                        <iframe
                            src={previewUrl}
                            className="h-[60vh] w-full border-0"
                            title={document.file_name}
                        />
                    ) : (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <FileText className="h-16 w-16 text-muted-foreground" />
                            <p className="mt-4 text-sm font-medium">{document.file_name}</p>
                            <p className="text-sm text-muted-foreground">{formatFileSize(document.file_size)}</p>
                            <p className="mt-2 text-xs text-muted-foreground">Preview not available for this file type</p>
                        </div>
                    )}
                </div>

                <div className="mt-4 flex justify-end">
                    <Button asChild>
                        <a href={downloadUrl} download>
                            <Download className="mr-1.5 h-4 w-4" />
                            Download
                        </a>
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
