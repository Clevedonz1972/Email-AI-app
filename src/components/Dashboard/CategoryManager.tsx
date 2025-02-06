import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Chip, 
  Tooltip, 
  IconButton, 
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  useTheme 
} from '@mui/material';
import { styled } from '@mui/material/styles';
import AddIcon from '@mui/icons-material/Add';
import FolderIcon from '@mui/icons-material/Folder';
import WorkIcon from '@mui/icons-material/Work';
import HomeIcon from '@mui/icons-material/Home';
import ReceiptIcon from '@mui/icons-material/Receipt';
import FavoriteIcon from '@mui/icons-material/Favorite';
import SettingsIcon from '@mui/icons-material/Settings';

interface CategoryManagerProps {
  onCategoryChange: (category: string) => void;
  selectedCategory: string;
}

const CategoryChip = styled(Chip)(({ theme }) => ({
  margin: theme.spacing(0.5),
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
  },
}));

const CategoryDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    padding: theme.spacing(2),
    minWidth: 300,
  },
}));

export const CategoryManager: React.FC<CategoryManagerProps> = ({
  onCategoryChange,
  selectedCategory,
}) => {
  const theme = useTheme();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [customCategories, setCustomCategories] = useState<string[]>([]);

  // Predefined categories with icons and descriptions
  const defaultCategories = [
    {
      id: 'all',
      label: 'All',
      icon: <FolderIcon />,
      description: 'View all emails',
      color: theme.palette.primary.main,
    },
    {
      id: 'work',
      label: 'Work',
      icon: <WorkIcon />,
      description: 'Work-related emails and projects',
      color: theme.palette.info.main,
    },
    {
      id: 'personal',
      label: 'Personal',
      icon: <HomeIcon />,
      description: 'Personal and family emails',
      color: theme.palette.success.main,
    },
    {
      id: 'bills',
      label: 'Bills & Finance',
      icon: <ReceiptIcon />,
      description: 'Bills, invoices, and financial matters',
      color: theme.palette.warning.main,
    },
    {
      id: 'important',
      label: 'Important',
      icon: <FavoriteIcon />,
      description: 'High-priority emails that need attention',
      color: theme.palette.error.main,
    },
  ];

  const handleAddCategory = () => {
    if (newCategory.trim()) {
      setCustomCategories([...customCategories, newCategory.trim()]);
      setNewCategory('');
      setIsDialogOpen(false);
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleAddCategory();
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">Categories</Typography>
        <Tooltip title="Add new category">
          <IconButton 
            onClick={() => setIsDialogOpen(true)}
            aria-label="Add new category"
            size="small"
          >
            <AddIcon />
          </IconButton>
        </Tooltip>
      </Box>

      <Box 
        display="flex" 
        flexWrap="wrap" 
        gap={1}
        role="radiogroup"
        aria-label="Email categories"
      >
        {defaultCategories.map(({ id, label, icon, description, color }) => (
          <Tooltip key={id} title={description} arrow>
            <CategoryChip
              icon={icon}
              label={label}
              onClick={() => onCategoryChange(id)}
              color={selectedCategory === id ? "primary" : "default"}
              variant={selectedCategory === id ? "filled" : "outlined"}
              clickable
              aria-checked={selectedCategory === id}
              role="radio"
              sx={{
                borderColor: color,
                color: selectedCategory === id ? 'white' : color,
                backgroundColor: selectedCategory === id ? color : 'transparent',
              }}
            />
          </Tooltip>
        ))}

        {customCategories.map((category) => (
          <Tooltip key={category} title={`Custom category: ${category}`} arrow>
            <CategoryChip
              label={category}
              onClick={() => onCategoryChange(category)}
              color={selectedCategory === category ? "primary" : "default"}
              variant={selectedCategory === category ? "filled" : "outlined"}
              clickable
              aria-checked={selectedCategory === category}
              role="radio"
            />
          </Tooltip>
        ))}
      </Box>

      <CategoryDialog
        open={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        aria-labelledby="category-dialog-title"
      >
        <DialogTitle id="category-dialog-title">
          Add New Category
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Category Name"
            fullWidth
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            onKeyPress={handleKeyPress}
            helperText="Create a new category to organize your emails"
            aria-label="New category name"
          />
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setIsDialogOpen(false)}
            color="inherit"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleAddCategory}
            color="primary"
            disabled={!newCategory.trim()}
          >
            Add Category
          </Button>
        </DialogActions>
      </CategoryDialog>

      {selectedCategory !== 'all' && (
        <Typography 
          variant="body2" 
          color="textSecondary" 
          mt={2}
          role="status"
          aria-live="polite"
        >
          Showing emails in {selectedCategory} category
        </Typography>
      )}
    </Box>
  );
}; 