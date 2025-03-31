import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  Grid,
  Paper,
  Tab,
  Tabs,
  Typography,
  List,
  ListItem,
  ListItemText,
  Chip,
  Button,
  Alert,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  IconButton
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import MemoryIcon from '@mui/icons-material/Memory';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import SchemaIcon from '@mui/icons-material/Schema';
import BubbleChartIcon from '@mui/icons-material/BubbleChart';
import PsychologyIcon from '@mui/icons-material/Psychology';
import TimelineIcon from '@mui/icons-material/Timeline';
import RefreshIcon from '@mui/icons-material/Refresh';
import { ApiClient } from '../../services/apiClient';

// TabPanel component for tab content
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`brain-tabpanel-${index}`}
      aria-labelledby={`brain-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `brain-tab-${index}`,
    'aria-controls': `brain-tabpanel-${index}`,
  };
}

// API service for the brain viewer
const brainViewerApiService = {
  getVectorEntries: async (emailId?: string): Promise<any> => {
    try {
      const url = emailId 
        ? `/api/testing/testing/brain/vector-entries?email_id=${emailId}` 
        : '/api/testing/testing/brain/vector-entries';
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch vector entries: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching vector entries:', error);
      throw error;
    }
  },
  
  getGraphData: async (emailId?: string, nodeType?: string): Promise<any> => {
    try {
      let url = '/api/testing/testing/brain/graph-data';
      const params = new URLSearchParams();
      
      if (emailId) params.append('email_id', emailId);
      if (nodeType) params.append('node_type', nodeType);
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch graph data: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching graph data:', error);
      throw error;
    }
  },
  
  getAiProcessData: async (emailId: string): Promise<any> => {
    try {
      const response = await fetch(`/api/testing/testing/brain/ai-process/${emailId}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch AI process data: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching AI process data:', error);
      throw error;
    }
  }
};

// Main component
export const BrainViewer: React.FC<{ emailId?: string }> = ({ emailId }) => {
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [vectorEntries, setVectorEntries] = useState<any[]>([]);
  const [graphData, setGraphData] = useState<{ nodes: any[], edges: any[] }>({ nodes: [], edges: [] });
  const [aiProcessData, setAiProcessData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [nodeTypeFilter, setNodeTypeFilter] = useState<string>('');
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedVectorId, setSelectedVectorId] = useState<string | null>(null);
  
  // Fetch data on component mount or when email ID changes
  useEffect(() => {
    fetchData();
  }, [emailId]);
  
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch vector entries
      const vectorData = await brainViewerApiService.getVectorEntries(emailId);
      setVectorEntries(vectorData?.entries || []);
      
      // Fetch graph data
      const graphResult = await brainViewerApiService.getGraphData(emailId, nodeTypeFilter || undefined);
      setGraphData({
        nodes: graphResult?.nodes || [],
        edges: graphResult?.edges || []
      });
      
      // If email ID is provided, fetch AI process data
      if (emailId) {
        try {
          const processData = await brainViewerApiService.getAiProcessData(emailId);
          setAiProcessData(processData);
        } catch (err) {
          console.warn('Failed to load AI process data', err);
          // Non-critical error, continue
        }
      }
    } catch (err) {
      console.error('Error fetching data for Brain Viewer:', err);
      setError('Failed to load brain data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  const handleNodeSelect = (nodeId: string) => {
    setSelectedNodeId(nodeId === selectedNodeId ? null : nodeId);
  };
  
  const handleVectorSelect = (vectorId: string) => {
    setSelectedVectorId(vectorId === selectedVectorId ? null : vectorId);
  };
  
  const handleNodeTypeFilterChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setNodeTypeFilter(event.target.value as string);
    // Refetch with new filter
    brainViewerApiService.getGraphData(emailId, event.target.value as string)
      .then(data => setGraphData(data))
      .catch(err => console.error('Error applying node type filter:', err));
  };
  
  const handleSearchQueryChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };
  
  const handleSearch = () => {
    // Filter the data client-side for demo
    // In a real implementation, this would call the API with a search parameter
    console.log('Searching for:', searchQuery);
  };
  
  // Function to render similarity score chip
  const renderSimilarityScore = (score: number) => {
    let color: 'success' | 'warning' | 'error' | 'default' = 'default';
    
    if (score >= 0.9) color = 'success';
    else if (score >= 0.7) color = 'warning';
    else color = 'error';
    
    return (
      <Chip 
        label={`${(score * 100).toFixed(1)}%`} 
        color={color} 
        size="small" 
        variant="outlined"
      />
    );
  };
  
  // Function to render node type chips
  const renderNodeTypeChip = (type: string) => {
    let color: 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' | 'default' = 'default';
    let icon = null;
    
    switch (type.toUpperCase()) {
      case 'EMAIL':
        color = 'primary';
        break;
      case 'PERSON':
        color = 'secondary';
        break;
      case 'TASK':
        color = 'info';
        break;
      case 'USER':
        color = 'success';
        break;
      case 'EVENT':
        color = 'warning';
        break;
      default:
        color = 'default';
    }
    
    return <Chip label={type} color={color} size="small" />;
  };
  
  return (
    <Box sx={{ width: '100%' }}>
      <Paper sx={{ width: '100%', mb: 2 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange} 
            aria-label="brain viewer tabs"
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab icon={<MemoryIcon />} label="Vector Memory" {...a11yProps(0)} />
            <Tab icon={<AccountTreeIcon />} label="Knowledge Graph" {...a11yProps(1)} />
            <Tab icon={<PsychologyIcon />} label="AI Process" {...a11yProps(2)} />
          </Tabs>
        </Box>
        
        {error && (
          <Alert severity="error" sx={{ m: 2 }}>
            {error}
          </Alert>
        )}
        
        {/* Vector Memory Tab */}
        <TabPanel value={tabValue} index={0}>
          <Box sx={{ mb: 2 }}>
            <Typography variant="h6" gutterBottom>
              Vector Memory Entries
            </Typography>
            <Typography variant="body2" color="text.secondary">
              These are the vector embeddings stored in ChromaDB for semantic search and retrieval.
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', mb: 2, gap: 2 }}>
            <TextField
              label="Search Vector Content"
              variant="outlined"
              size="small"
              fullWidth
              value={searchQuery}
              onChange={handleSearchQueryChange}
            />
            <IconButton onClick={handleSearch} color="primary">
              <SearchIcon />
            </IconButton>
            <IconButton onClick={fetchData} disabled={loading}>
              <RefreshIcon />
            </IconButton>
          </Box>
          
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              {vectorEntries.length === 0 ? (
                <Alert severity="info">
                  No vector memory entries found. Process some emails to create vector embeddings.
                </Alert>
              ) : (
                <List>
                  {vectorEntries.map((vector, index) => (
                    <React.Fragment key={vector.id}>
                      <ListItem 
                        button 
                        onClick={() => handleVectorSelect(vector.id)}
                        selected={selectedVectorId === vector.id}
                      >
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Chip label={vector.type} color="primary" size="small" />
                              <Typography variant="body1">
                                {vector.text && vector.text.length > 50 
                                  ? `${vector.text.substring(0, 50)}...` 
                                  : vector.text || "No text available"}
                              </Typography>
                            </Box>
                          }
                          secondary={
                            <Box sx={{ mt: 1 }}>
                              <Typography variant="body2" color="text.secondary">
                                ID: {vector.id}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                Model: {vector.embedding_model}
                              </Typography>
                              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, gap: 1 }}>
                                <Typography variant="body2" color="text.secondary">
                                  Similarity Score:
                                </Typography>
                                {renderSimilarityScore(vector.similarity_score)}
                              </Box>
                            </Box>
                          }
                        />
                      </ListItem>
                      {selectedVectorId === vector.id && (
                        <Box sx={{ pl: 2, pr: 2, pb: 2, bgcolor: 'background.default' }}>
                          <Typography variant="subtitle2" gutterBottom>
                            Metadata:
                          </Typography>
                          <Paper sx={{ p: 2 }}>
                            <pre style={{ margin: 0, overflowX: 'auto' }}>
                              {JSON.stringify(vector.metadata, null, 2)}
                            </pre>
                          </Paper>
                        </Box>
                      )}
                      {index < vectorEntries.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              )}
            </>
          )}
        </TabPanel>
        
        {/* Knowledge Graph Tab */}
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ mb: 2 }}>
            <Typography variant="h6" gutterBottom>
              Knowledge Graph Visualization
            </Typography>
            <Typography variant="body2" color="text.secondary">
              This shows the connections between entities in the Neo4j knowledge graph.
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', mb: 2, gap: 2 }}>
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel id="node-type-filter-label">Filter by Node Type</InputLabel>
              <Select
                labelId="node-type-filter-label"
                value={nodeTypeFilter}
                label="Filter by Node Type"
                onChange={handleNodeTypeFilterChange as any}
              >
                <MenuItem value="">All Types</MenuItem>
                <MenuItem value="EMAIL">Email</MenuItem>
                <MenuItem value="PERSON">Person</MenuItem>
                <MenuItem value="TASK">Task</MenuItem>
                <MenuItem value="EVENT">Event</MenuItem>
              </Select>
            </FormControl>
            <Button 
              variant="outlined" 
              onClick={fetchData}
              disabled={loading}
              startIcon={<RefreshIcon />}
            >
              Refresh Graph
            </Button>
          </Box>
          
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              {graphData.nodes.length === 0 ? (
                <Alert severity="info">
                  No graph nodes found. Process some emails to create knowledge graph nodes.
                </Alert>
              ) : (
                <Grid container spacing={2}>
                  <Grid item xs={12} md={selectedNodeId ? 6 : 12}>
                    <Card>
                      <CardContent>
                        <Typography variant="subtitle1" gutterBottom>
                          Graph Nodes ({graphData.nodes.length})
                        </Typography>
                        <List dense>
                          {graphData.nodes.map((node) => (
                            <React.Fragment key={node.id}>
                              <ListItem
                                button
                                onClick={() => handleNodeSelect(node.id)}
                                selected={selectedNodeId === node.id}
                              >
                                <ListItemText
                                  primary={
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                      {renderNodeTypeChip(node.type)}
                                      <Typography variant="body1">
                                        {node.label}
                                      </Typography>
                                    </Box>
                                  }
                                  secondary={
                                    <Typography variant="body2" color="text.secondary">
                                      ID: {node.id}
                                    </Typography>
                                  }
                                />
                              </ListItem>
                              <Divider />
                            </React.Fragment>
                          ))}
                        </List>
                      </CardContent>
                    </Card>
                  </Grid>
                  
                  {selectedNodeId && (
                    <Grid item xs={12} md={6}>
                      <Card>
                        <CardContent>
                          <Typography variant="subtitle1" gutterBottom>
                            Node Details
                          </Typography>
                          
                          {graphData.nodes.filter(node => node.id === selectedNodeId).map(node => (
                            <Box key={node.id}>
                              <Typography variant="subtitle2">
                                {node.label} ({node.type})
                              </Typography>
                              
                              <Typography variant="subtitle2" sx={{ mt: 2 }}>
                                Properties:
                              </Typography>
                              <Paper sx={{ p: 2, mt: 1, mb: 2 }}>
                                <pre style={{ margin: 0, overflowX: 'auto' }}>
                                  {JSON.stringify(node.properties, null, 2)}
                                </pre>
                              </Paper>
                              
                              <Typography variant="subtitle2" sx={{ mt: 2 }}>
                                Relationships:
                              </Typography>
                              <List dense>
                                {graphData.edges
                                  .filter(edge => edge.source === node.id || edge.target === node.id)
                                  .map(edge => (
                                    <ListItem key={edge.id}>
                                      <ListItemText
                                        primary={
                                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            <Chip label={edge.label} color="secondary" size="small" />
                                          </Box>
                                        }
                                        secondary={
                                          <>
                                            {edge.source === node.id ? (
                                              <Typography variant="body2" color="text.secondary">
                                                {node.id} → {edge.target}
                                              </Typography>
                                            ) : (
                                              <Typography variant="body2" color="text.secondary">
                                                {edge.source} → {node.id}
                                              </Typography>
                                            )}
                                          </>
                                        }
                                      />
                                    </ListItem>
                                  ))}
                                
                                {graphData.edges.filter(edge => edge.source === node.id || edge.target === node.id).length === 0 && (
                                  <ListItem>
                                    <ListItemText
                                      primary="No relationships found for this node"
                                    />
                                  </ListItem>
                                )}
                              </List>
                            </Box>
                          ))}
                        </CardContent>
                      </Card>
                    </Grid>
                  )}
                </Grid>
              )}
            </>
          )}
        </TabPanel>
        
        {/* AI Process Tab */}
        <TabPanel value={tabValue} index={2}>
          <Box sx={{ mb: 2 }}>
            <Typography variant="h6" gutterBottom>
              AI Processing Steps
            </Typography>
            <Typography variant="body2" color="text.secondary">
              This shows the complete AI processing pipeline with inputs, outputs and token usage.
            </Typography>
          </Box>
          
          {!emailId && (
            <Alert severity="info" sx={{ mb: 2 }}>
              Select an email to view its AI processing details.
            </Alert>
          )}
          
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              {emailId && !aiProcessData ? (
                <Alert severity="warning">
                  No AI processing data available for this email.
                </Alert>
              ) : emailId && aiProcessData && (
                <>
                  <Card sx={{ mb: 2 }}>
                    <CardContent>
                      <Typography variant="subtitle1" gutterBottom>
                        Processing Summary
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6} md={3}>
                          <Paper sx={{ p: 2, textAlign: 'center' }}>
                            <Typography variant="h6">
                              {aiProcessData?.metrics?.total_steps || 0}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Total Steps
                            </Typography>
                          </Paper>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                          <Paper sx={{ p: 2, textAlign: 'center' }}>
                            <Typography variant="h6">
                              {(aiProcessData?.metrics?.total_tokens || 0).toLocaleString()}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Tokens Used
                            </Typography>
                          </Paper>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                          <Paper sx={{ p: 2, textAlign: 'center' }}>
                            <Typography variant="h6">
                              ${aiProcessData?.metrics?.estimated_cost || '0.00'}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Est. Cost
                            </Typography>
                          </Paper>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                          <Paper sx={{ p: 2, textAlign: 'center' }}>
                            <Typography variant="h6">
                              {aiProcessData?.metrics?.processing_time_ms || 0}ms
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Processing Time
                            </Typography>
                          </Paper>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                  
                  <Typography variant="subtitle1" gutterBottom>
                    Processing Steps
                  </Typography>
                  
                  <Stack spacing={2}>
                    {(aiProcessData?.steps || []).map((step: any) => (
                      <Card key={step.step} sx={{ mb: 1 }}>
                        <CardContent>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Chip 
                                label={`Step ${step.step}`} 
                                color="primary" 
                                size="small" 
                              />
                              <Typography variant="subtitle1">
                                {step.name || 'Unknown Step'}
                              </Typography>
                            </Box>
                            <Chip 
                              label={`${step.tokens_used || 0} tokens`} 
                              color="secondary" 
                              size="small" 
                              variant="outlined" 
                            />
                          </Box>
                          
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            {step.description || 'No description available'}
                          </Typography>
                          
                          <Typography variant="subtitle2" gutterBottom sx={{ mt: 1 }}>
                            Model: {step.model || 'Unknown'}
                          </Typography>
                          
                          <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                            Input:
                          </Typography>
                          <Paper 
                            sx={{ 
                              p: 1, 
                              backgroundColor: 'background.default',
                              maxHeight: '100px',
                              overflow: 'auto'
                            }}
                          >
                            <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                              {step.input && step.input.length > 200 ? 
                                `${step.input.substring(0, 200)}...` : step.input || 'No input data'}
                            </Typography>
                          </Paper>
                          
                          <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                            Output:
                          </Typography>
                          <Paper 
                            sx={{ 
                              p: 1, 
                              backgroundColor: 'background.default',
                              maxHeight: '150px',
                              overflow: 'auto'
                            }}
                          >
                            <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                              {step.output || 'No output data'}
                            </Typography>
                          </Paper>
                        </CardContent>
                      </Card>
                    ))}
                    
                    {!aiProcessData?.steps?.length && (
                      <Alert severity="info">No processing steps available</Alert>
                    )}
                  </Stack>
                </>
              )}
            </>
          )}
        </TabPanel>
      </Paper>
    </Box>
  );
};

export default BrainViewer; 