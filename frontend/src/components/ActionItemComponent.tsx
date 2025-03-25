import React from 'react';
import { ListItem, ListItemIcon, ListItemText, Checkbox } from '@mui/material';
import { ActionItem } from '../types/email';

interface ActionItemComponentProps {
  item: ActionItem;
  index: number;
  emailId: string;
}

export const ActionItemComponent: React.FC<ActionItemComponentProps> = ({ 
  item, 
  index, 
  emailId 
}) => {
  return (
    <ListItem key={`${emailId}-action-${index}`} alignItems="flex-start">
      <ListItemIcon>
        <Checkbox
          edge="start"
          checked={item.completed}
          tabIndex={-1}
          disableRipple
          inputProps={{ 'aria-labelledby': `item-${emailId}-${item.id}` }}
        />
      </ListItemIcon>
      <ListItemText 
        id={`item-${emailId}-${item.id}`}
        primary={item.description} 
      />
    </ListItem>
  );
}; 