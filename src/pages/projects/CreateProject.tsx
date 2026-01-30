import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import { createProject } from '../../api/projects';
import { useAuth } from '../../context/AuthContext';

const CreateProject: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const project = await createProject({ name, description });
            navigate(`/projects/${project.id}`);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to create project');
        } finally {
            setLoading(false);
        }
    };

    if (user?.role !== 'admin') {
        return (
            <Layout>
                <div className="p-4 sm:p-6 lg:p-8 text-center text-red-600 text-sm sm:text-base">
                    Only admins can create projects.
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="max-w-2xl mx-auto py-4 sm:py-6 lg:py-8 px-3 sm:px-4">
                <h1 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Create New Project</h1>
                
                {error && (
                    <div className="bg-red-50 text-red-600 p-3 sm:p-4 rounded text-sm sm:text-base mb-4">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6 bg-white p-4 sm:p-6 rounded-lg shadow">
                    <div>
                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                            Project Name
                        </label>
                        <input
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                            Description
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={4}
                            className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 sm:gap-0 pt-2 sm:pt-4">
                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            className="w-full sm:w-auto sm:mr-4 px-4 py-2 text-sm sm:text-base text-gray-600 hover:text-gray-800 border border-gray-200 sm:border-0 rounded"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full sm:w-auto px-4 sm:px-6 py-2 text-sm sm:text-base bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                        >
                            {loading ? 'Creating...' : 'Create Project'}
                        </button>
                    </div>
                </form>
            </div>
        </Layout>
    );
};

export default CreateProject;
