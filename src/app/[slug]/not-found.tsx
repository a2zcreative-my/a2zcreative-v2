import Link from 'next/link';

export default function InvitationNotFound() {
    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-6">
            <div className="text-center max-w-md">
                {/* Icon */}
                <div className="text-6xl mb-6">💌</div>

                {/* Title */}
                <h1 className="text-3xl font-bold text-white mb-4">
                    Invitation Not Found
                </h1>

                {/* Description */}
                <p className="text-foreground-muted mb-8">
                    Sorry, we couldn't find the invitation you're looking for.
                    It may have been removed or the link is incorrect.
                </p>

                {/* Actions */}
                <div className="space-y-4">
                    <Link href="/" className="btn-primary block">
                        Go to Homepage
                    </Link>
                    <p className="text-sm text-foreground-muted">
                        Want to create your own invitation?{' '}
                        <Link href="/auth/register" className="text-primary hover:underline">
                            Sign up now
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
