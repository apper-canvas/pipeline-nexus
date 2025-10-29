import React from 'react';
import Badge from '@/components/atoms/Badge';
import Button from '@/components/atoms/Button';
import ApperIcon from '@/components/ApperIcon';
import { format } from 'date-fns';

const ActivityCard = ({ activity, onEdit, onDelete }) => {
  const getTypeColor = (type) => {
    const colors = {
      'Call': 'blue',
      'Email': 'green',
      'Meeting': 'purple',
      'Note': 'gray',
      'Task': 'orange'
    };
    return colors[type] || 'gray';
  };

  const getTypeIcon = (type) => {
    const icons = {
      'Call': 'Phone',
      'Email': 'Mail',
      'Meeting': 'Calendar',
      'Note': 'FileText',
      'Task': 'CheckSquare'
    };
    return icons[type] || 'Activity';
  };

  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy h:mm a');
    } catch {
      return dateString;
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow duration-200">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className={`w-10 h-10 rounded-lg bg-${getTypeColor(activity.type_c)}-100 flex items-center justify-center`}>
            <ApperIcon name={getTypeIcon(activity.type_c)} className={`w-5 h-5 text-${getTypeColor(activity.type_c)}-600`} />
          </div>
          <div>
            <Badge variant={getTypeColor(activity.type_c)} size="sm">
              {activity.type_c}
            </Badge>
            <p className="text-xs text-gray-500 mt-1">
              {formatDate(activity.date_c)}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(activity)}
            className="p-1.5 h-auto"
          >
            <ApperIcon name="Edit2" className="w-4 h-4 text-gray-600" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(activity.Id)}
            className="p-1.5 h-auto text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <ApperIcon name="Trash2" className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Description */}
      {activity.description_c && (
        <p className="text-sm text-gray-700 mb-3 line-clamp-3">
          {activity.description_c}
        </p>
      )}

      {/* Footer - Contact & Deal Info */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <div className="flex items-center text-xs text-gray-500">
          <ApperIcon name="User" className="w-3.5 h-3.5 mr-1" />
          <span>
            {activity.contact_id_c?.Name || `Contact #${activity.contact_id_c}`}
          </span>
        </div>
        {activity.deal_id_c && (
          <div className="flex items-center text-xs text-gray-500">
            <ApperIcon name="DollarSign" className="w-3.5 h-3.5 mr-1" />
            <span>
              {activity.deal_id_c?.Name || `Deal #${activity.deal_id_c}`}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityCard;