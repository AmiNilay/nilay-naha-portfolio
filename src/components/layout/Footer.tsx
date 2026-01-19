export default function Footer() {
    return (
        <footer className="border-t border-border bg-background py-8 mt-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="text-sm text-muted-foreground">
                    &copy; {new Date().getFullYear()} Nilay Naha. All rights reserved.
                </div>
                <div className="flex gap-6 text-sm text-muted-foreground">
                    <a href="https://github.com" className="hover:text-foreground">GitHub</a>
                    <a href="https://linkedin.com" className="hover:text-foreground">LinkedIn</a>
                    <a href="mailto:hello@example.com" className="hover:text-foreground">Email</a>
                </div>
            </div>
        </footer>
    );
}