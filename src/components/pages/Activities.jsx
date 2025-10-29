import React, { useState, useEffect } from 'react';
import Header from '@/components/organisms/Header';
import ActivityCard from '@/components/molecules/ActivityCard';
import ActivityForm from '@/components/molecules/ActivityForm';
import Modal from '@/components/atoms/Modal';
import Button from '@/components/atoms/Button';
import Badge from '@/components/atoms/Badge';
import Loading from '@/components/ui/Loading';
import Empty from '@/components/ui/Empty';
import Error from '@/components/ui/Error';
import ApperIcon from '@/components/ApperIcon';
import { activitiesService } from '@/services/api/activitiesService';
import { toast } from 'react-toastify';

const Activities = () => {
  const [activities, setActivities] = useState([]);
  const [filteredActivities, setFilteredActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('All');
  const [sortBy, setSortBy] = useState('newest');
  
  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const activityTypes = ['All', 'Call', 'Email', 'Meeting', 'Note', 'Task'];

  useEffect(() => {
    loadActivities();
  }, []);

  useEffect(() => {
    filterAndSortActivities();
  }, [activities, searchQuery, selectedType, sortBy]);

  const loadActivities = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await activitiesService.getAll();
      setActivities(data);
    } catch (err) {
      console.error('Error loading activities:', err);
      setError(err.message || 'Failed to load activities');
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortActivities = () => {
    let filtered = [...activities];

    // Filter by type
    if (selectedType !== 'All') {
      filtered = filtered.filter(a => a.type_c === selectedType);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(a => 
        a.description_c?.toLowerCase().includes(query) ||
        a.type_c?.toLowerCase().includes(query) ||
        a.contact_id_c?.Name?.toLowerCase().includes(query) ||
        a.deal_id_c?.Name?.toLowerCase().includes(query)
      );
    }

    // Sort
    filtered.sort((a, b) => {
      const dateA = new Date(a.date_c);
      const dateB = new Date(b.date_c);
      return sortBy === 'newest' ? dateB - dateA : dateA - dateB;
    });

    setFilteredActivities(filtered);
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  const handleAddActivity = () => {
    setIsAddModalOpen(true);
  };

  const handleCreateActivity = async (activityData) => {
    try {
      await activitiesService.create(activityData);
      toast.success('Activity created successfully');
      setIsAddModalOpen(false);
      loadActivities();
    } catch (error) {
      console.error('Error creating activity:', error);
      toast.error(error.message || 'Failed to create activity');
      throw error;
    }
  };

  const handleEditActivity = (activity) => {
    setEditingActivity(activity);
    setIsEditModalOpen(true);
  };

  const handleUpdateActivity = async (activityData) => {
    try {
      await activitiesService.update(editingActivity.Id, activityData);
      toast.success('Activity updated successfully');
      setIsEditModalOpen(false);
      setEditingActivity(null);
      loadActivities();
    } catch (error) {
      console.error('Error updating activity:', error);
      toast.error(error.message || 'Failed to update activity');
      throw error;
    }
  };

  const handleDeleteClick = (activityId) => {
    setDeleteConfirmId(activityId);
  };

  const handleDeleteConfirm = async () => {
    try {
      await activitiesService.delete(deleteConfirmId);
      toast.success('Activity deleted successfully');
      setDeleteConfirmId(null);
      loadActivities();
    } catch (error) {
      console.error('Error deleting activity:', error);
      toast.error(error.message || 'Failed to delete activity');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header onSearch={handleSearch} searchValue={searchQuery} />
        <Loading type="page" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header onSearch={handleSearch} searchValue={searchQuery} />
        <Error message={error} onRetry={loadActivities} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        onSearch={handleSearch} 
        searchValue={searchQuery}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Activities</h1>
              <p className="text-sm text-gray-500 mt-1">
                {filteredActivities.length} {filteredActivities.length === 1 ? 'activity' : 'activities'}
              </p>
            </div>
            <Button variant="primary" onClick={handleAddActivity}>
              <ApperIcon name="Plus" className="w-4 h-4 mr-2" />
              Add Activity
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            {/* Type Filter */}
            <div className="flex items-center space-x-2 overflow-x-auto">
              {activityTypes.map(type => (
                <button
                  key={type}
                  onClick={() => setSelectedType(type)}
                  className={`
                    px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors
                    ${selectedType === type
                      ? 'bg-primary-100 text-primary-700'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }
                  `}
                >
                  {type}
                </button>
              ))}
            </div>

            {/* Sort */}
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
              </select>
            </div>
          </div>
        </div>

        {/* Activities Grid */}
        {filteredActivities.length === 0 ? (
          <Empty
            title="No activities found"
            description={
              searchQuery || selectedType !== 'All'
                ? 'Try adjusting your filters'
                : 'Get started by creating your first activity'
            }
            action={
              <Button variant="primary" onClick={handleAddActivity}>
                <ApperIcon name="Plus" className="w-4 h-4 mr-2" />
                Add Activity
              </Button>
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredActivities.map(activity => (
              <ActivityCard
                key={activity.Id}
                activity={activity}
                onEdit={handleEditActivity}
                onDelete={handleDeleteClick}
              />
            ))}
          </div>
        )}
      </div>

      {/* Add Activity Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Activity"
      >
        <ActivityForm
          onSubmit={handleCreateActivity}
          onCancel={() => setIsAddModalOpen(false)}
        />
      </Modal>

      {/* Edit Activity Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingActivity(null);
        }}
        title="Edit Activity"
      >
        <ActivityForm
          initialData={editingActivity}
          onSubmit={handleUpdateActivity}
          onCancel={() => {
            setIsEditModalOpen(false);
            setEditingActivity(null);
          }}
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteConfirmId}
        onClose={() => setDeleteConfirmId(null)}
        title="Delete Activity"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to delete this activity? This action cannot be undone.
          </p>
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => setDeleteConfirmId(null)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700"
            >
              <ApperIcon name="Trash2" className="w-4 h-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Activities;