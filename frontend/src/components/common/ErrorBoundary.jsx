import React from 'react';
import Button from './Button';

export default class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('Unhandled UI error in route view:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="rounded-2xl border border-pomegranate/40 bg-pomegranate/10 p-8 text-center text-cod-gray">
                    <h2 className="text-xl font-bold">Something went wrong in this section</h2>
                    <p className="mt-2 text-sm text-cod-gray/75">
                        {this.state.error?.message || 'An unexpected rendering error occurred.'}
                    </p>
                    <Button
                        variant="secondary"
                        size="sm"
                        className="mt-4"
                        onClick={() => {
                            this.setState({ hasError: false, error: null });
                            if (this.props.onReset) this.props.onReset();
                        }}
                    >
                        Try reloading this view
                    </Button>
                </div>
            );
        }

        return this.props.children;
    }
}
