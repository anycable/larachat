import { useForm } from '@inertiajs/react';

export default function Auth() {
    const { data, setData, post, processing, errors } = useForm({
        username: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (data.username.trim().length > 0) {
            post(route('chat.set-username'));
        }
    };

    return (
        <main className="mx-auto flex flex-col items-center w-screen">
            <div className="grid h-screen items-center">
                <div className="-mt-12 flex max-w-xs flex-col">
                    <div className="my-4 flex items-baseline justify-between">
                        <div className='flex items-center space-x-2'>
                            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-teal-600 bg-clip-text text-transparent">
                                LaraChat
                            </h1>
                        </div>
                        <h1 className="text-center text-xl font-semibold">
                            Log in
                        </h1>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="username" className="sr-only">
                                Username
                            </label>
                            <input
                                id="username"
                                type="text"
                                value={data.username}
                                onChange={(e) => setData('username', e.target.value)}
                                className="w-full rounded-md border-0 px-3 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-teal-600 sm:text-sm sm:leading-6 dark:text-gray-100"
                                placeholder="Enter your name"
                                autoComplete="off"
                                autoFocus
                            />
                            {errors.username && (
                                <p className="mt-1 text-sm text-red-600">{errors.username}</p>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={processing || !data.username.trim()}
                            className="w-full rounded-md bg-teal-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-teal-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {processing ? 'Setting...' : 'Join Chat'}
                        </button>
                    </form>
                </div>
            </div>
        </main>
    );
}
