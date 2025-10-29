import React, { useState, useEffect } from 'react';
import Input from '@/components/atoms/Input';
import Button from '@/components/atoms/Button';
import Select from '@/components/atoms/Select';
import ApperIcon from '@/components/ApperIcon';
import { contactsService } from '@/services/api/contactsService';
import { dealsService } from '@/services/api/dealsService';
import { toast } from 'react-toastify';

const ActivityForm = ({ onSubmit, onCancel, initialData = null }) => {
  const [formData, setFormData] = useState({
    date_c: initialData?.date_c ? new Date(initialData.date_c).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16),
    type_c: initialData?.type_c || 'Call',
    description_c: initialData?.description_c || '',
    contact_id_c: initialData?.contact_id_c?.Id || initialData?.contact_id_c || '',
    deal_id_c: initialData?.deal_id_c?.Id || initialData?.deal_id_c || ''
  });

  const [contacts, setContacts] = useState([]);
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  const activityTypes = [
    { value: 'Call', label: 'Call', icon: 'Phone' },
    { value: 'Email', label: 'Email', icon: 'Mail' },
    { value: 'Meeting', label: 'Meeting', icon: 'Calendar' },
    { value: 'Note', label: 'Note', icon: 'FileText' },
    { value: 'Task', label: 'Task', icon: 'CheckSquare' }
  ];

  useEffect(() => {
    loadFormData();
  }, []);

  const loadFormData = async () => {
    try {
      setLoadingData(true);
      const [contactsData, dealsData] = await Promise.all([
        contactsService.getAll(),
        dealsService.getAll()
      ]);
      setContacts(contactsData);
      setDeals(dealsData);
    } catch (error) {
      console.error('Error loading form data:', error);
      toast.error('Failed to load form data');
    } finally {
      setLoadingData(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.date_c || !formData.type_c || !formData.contact_id_c) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      // Convert datetime-local to ISO format
      const submitData = {
        ...formData,
        date_c: new Date(formData.date_c).toISOString(),
        contact_id_c: parseInt(formData.contact_id_c),
        deal_id_c: formData.deal_id_c ? parseInt(formData.deal_id_c) : null
      };

      // Remove deal_id_c if null
      if (!submitData.deal_id_c) {
        delete submitData.deal_id_c;
      }

      await onSubmit(submitData);
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error(error.message || 'Failed to save activity');
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-2"></div>
          <p className="text-sm text-gray-500">Loading form...</p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Date & Time */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Date & Time <span className="text-red-500">*</span>
        </label>
        <Input
          type="datetime-local"
          name="date_c"
          value={formData.date_c}
          onChange={handleChange}
          required
        />
      </div>

      {/* Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Activity Type <span className="text-red-500">*</span>
        </label>
        <Select
          name="type_c"
          value={formData.type_c}
          onChange={handleChange}
          required
        >
          {activityTypes.map(type => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </Select>
      </div>

      {/* Contact */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Contact <span className="text-red-500">*</span>
        </label>
        <Select
          name="contact_id_c"
          value={formData.contact_id_c}
          onChange={handleChange}
          required
        >
          <option value="">Select a contact</option>
          {contacts.map(contact => (
            <option key={contact.Id} value={contact.Id}>
              {contact.name_c} {contact.company_c ? `- ${contact.company_c}` : ''}
            </option>
          ))}
        </Select>
      </div>

      {/* Deal (Optional) */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Deal (Optional)
        </label>
        <Select
          name="deal_id_c"
          value={formData.deal_id_c}
          onChange={handleChange}
        >
          <option value="">None</option>
          {deals.map(deal => (
            <option key={deal.Id} value={deal.Id}>
              {deal.name_c} - ${deal.value_c}
            </option>
          ))}
        </Select>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          name="description_c"
          value={formData.description_c}
          onChange={handleChange}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
          placeholder="Add notes about this activity..."
        />
      </div>

      {/* Actions */}
      <div className="flex justify-end space-x-3 pt-4 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          disabled={loading}
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Saving...
            </>
          ) : (
            <>
              <ApperIcon name="Save" className="w-4 h-4 mr-2" />
              {initialData ? 'Update Activity' : 'Create Activity'}
            </>
          )}
        </Button>
      </div>
    </form>
  );
};

export default ActivityForm;