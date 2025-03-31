import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Paper, 
  Box, 
  Tabs, 
  Tab, 
  List, 
  ListItem, 
  ListItemText, 
  Divider, 
  Chip, 
  Button,
  CircularProgress,
  Grid,
  Card,
  CardContent
} from '@mui/material';
import { knowledgeGraphService, GraphNode } from '../services/knowledgeGraphService';
import { memoryService, Memory, MemoryType } from '../services/memoryService';
import { reasoningService } from '../services/reasoningService';

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
      id={`graph-tabpanel-${index}`}
      aria-labelledby={`graph-tab-${index}`}
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
    id: `graph-tab-${index}`,
    'aria-controls': `graph-tabpanel-${index}`,
  };
}

interface MemoryStats {
  total: number;
  byType: Record<string, number>;
}

interface GraphStats {
  nodeCount: number;
  edgeCount: number;
  nodeTypes: { type: string; count: number }[];
  edgeTypes: { type: string; count: number }[];
}

export default function GraphVisualizer() {
  const [tabValue, setTabValue] = useState(0);
  const [memoryData, setMemoryData] = useState<Memory[]>([]);
  const [recentRelations, setRecentRelations] = useState<GraphNode[]>([]);
  const [memoryStats, setMemoryStats] = useState<MemoryStats>({
    total: 0,
    byType: {}
  });
  const [graphStats, setGraphStats] = useState<GraphStats>({
    nodeCount: 0,
    edgeCount: 0,
    nodeTypes: [],
    edgeTypes: []
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [relatedNodes, setRelatedNodes] = useState<GraphNode[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch memory data
        const emailMemories = await memoryService.getMemoriesByType(MemoryType.EMAIL);
        const taskMemories = await memoryService.getMemoriesByType(MemoryType.TASK);
        const conversationMemories = await memoryService.getMemoriesByType(MemoryType.CONVERSATION);
        const knowledgeMemories = await memoryService.getMemoriesByType(MemoryType.KNOWLEDGE);
        
        const allMemories = [
          ...emailMemories,
          ...taskMemories,
          ...conversationMemories,
          ...knowledgeMemories
        ];
        
        setMemoryData(allMemories);
        
        // Calculate memory statistics
        const stats: MemoryStats = {
          total: allMemories.length,
          byType: {
            [MemoryType.EMAIL]: emailMemories.length,
            [MemoryType.TASK]: taskMemories.length,
            [MemoryType.CONVERSATION]: conversationMemories.length,
            [MemoryType.KNOWLEDGE]: knowledgeMemories.length
          }
        };
        
        setMemoryStats(stats);
        
        // Mock graph statistics (in a real implementation, we'd fetch this from the backend)
        setGraphStats({
          nodeCount: allMemories.length,
          edgeCount: allMemories.length * 2, // Rough estimate
          nodeTypes: [
            { type: 'EMAIL', count: emailMemories.length },
            { type: 'TASK', count: taskMemories.length },
            { type: 'CONVERSATION', count: conversationMemories.length },
            { type: 'KNOWLEDGE', count: knowledgeMemories.length },
            { type: 'TEMPORAL_EVENT', count: 5 } // Mock data
          ],
          edgeTypes: [
            { type: 'RELATES_TO', count: 15 },
            { type: 'PART_OF', count: 12 },
            { type: 'CAUSED_BY', count: 8 },
            { type: 'SENT', count: 10 },
            { type: 'RECEIVED', count: 20 },
          ]
        });
        
        // For demo purposes, just select the first few memories as recent relations
        if (allMemories.length > 0) {
          const memoryIds = allMemories.slice(0, Math.min(5, allMemories.length)).map(m => m.id);
          const relatedList: GraphNode[] = [];
          
          for (const id of memoryIds) {
            try {
              // This is a mock implementation - in real app, we'd use the actual graph data
              relatedList.push({
                id,
                type: allMemories.find(m => m.id === id)?.type || MemoryType.EMAIL,
                content: allMemories.find(m => m.id === id)?.content || '',
                timestamp: Date.now(),
                relationships: [{
                  targetId: 'mock-target',
                  relationship: {
                    type: 'RELATES_TO',
                    properties: {
                      strength: 0.8,
                      timestamp: Date.now()
                    }
                  }
                }]
              });
            } catch (err) {
              console.error(`Error fetching related nodes for ${id}:`, err);
            }
          }
          
          setRecentRelations(relatedList);
        }
      } catch (error) {
        console.error('Error fetching graph data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  const handleNodeSelect = async (nodeId: string) => {
    setSelectedNode(nodeId);
    setLoading(true);
    
    try {
      // In a real implementation, we'd fetch this from the Neo4j graph
      // This is mocked for the current implementation
      const mockRelated = memoryData.slice(0, 3).map(memory => ({
        id: memory.id,
        type: memory.type,
        content: memory.content,
        timestamp: memory.timestamp,
        relationships: [{
          targetId: nodeId,
          relationship: {
            type: 'RELATES_TO',
            properties: {
              strength: Math.random(),
              timestamp: Date.now()
            }
          }
        }]
      }));
      
      setRelatedNodes(mockRelated);
    } catch (error) {
      console.error('Error fetching related nodes:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const renderNodeChip = (type: MemoryType | string) => {
    let color: 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' | 'default' = 'default';
    
    switch (type) {
      case MemoryType.EMAIL:
        color = 'primary';
        break;
      case MemoryType.TASK:
        color = 'secondary';
        break;
      case MemoryType.CONVERSATION:
        color = 'info';
        break;
      case MemoryType.KNOWLEDGE:
        color = 'success';
        break;
      case 'TEMPORAL_EVENT':
        color = 'warning';
        break;
      default:
        color = 'default';
    }
    
    return <Chip label={type} color={color} size="small" />;
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Knowledge Graph Visualizer
      </Typography>
      
      <Paper sx={{ width: '100%', mb: 4 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="graph visualizer tabs">
            <Tab label="Overview" {...a11yProps(0)} />
            <Tab label="Nodes & Relationships" {...a11yProps(1)} />
            <Tab label="Vector Memory" {...a11yProps(2)} />
            <Tab label="Reasoning" {...a11yProps(3)} />
          </Tabs>
        </Box>
        
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Knowledge Graph Statistics
                  </Typography>
                  
                  {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                      <CircularProgress />
                    </Box>
                  ) : (
                    <>
                      <Typography variant="body1">
                        Total Nodes: {graphStats.nodeCount}
                      </Typography>
                      <Typography variant="body1">
                        Total Edges: {graphStats.edgeCount}
                      </Typography>
                      <Typography variant="body2" sx={{ mt: 2 }}>
                        Node Types:
                      </Typography>
                      <List dense>
                        {graphStats.nodeTypes.map((item, index) => (
                          <ListItem key={index}>
                            <ListItemText 
                              primary={`${item.type}: ${item.count}`} 
                              secondary={`${Math.round((item.count / graphStats.nodeCount) * 100)}%`}
                            />
                            {renderNodeChip(item.type)}
                          </ListItem>
                        ))}
                      </List>
                    </>
                  )}
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Memory Statistics
                  </Typography>
                  
                  {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                      <CircularProgress />
                    </Box>
                  ) : (
                    <>
                      <Typography variant="body1">
                        Total Memories: {memoryStats.total}
                      </Typography>
                      <Typography variant="body2" sx={{ mt: 2 }}>
                        Memory Types:
                      </Typography>
                      <List dense>
                        {Object.entries(memoryStats.byType).map(([type, count], index) => (
                          <ListItem key={index}>
                            <ListItemText 
                              primary={`${type}: ${count}`} 
                              secondary={`${Math.round((count / memoryStats.total) * 100)}%`}
                            />
                            {renderNodeChip(type as MemoryType)}
                          </ListItem>
                        ))}
                      </List>
                    </>
                  )}
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Recent Relationships
                  </Typography>
                  
                  {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                      <CircularProgress />
                    </Box>
                  ) : (
                    <List>
                      {recentRelations.map((node, index) => (
                        <React.Fragment key={node.id}>
                          <ListItem>
                            <ListItemText
                              primary={
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  {renderNodeChip(node.type)}
                                  <Typography variant="body1">
                                    {node.content.length > 50 ? `${node.content.substring(0, 50)}...` : node.content}
                                  </Typography>
                                </Box>
                              }
                              secondary={
                                <>
                                  <Typography variant="body2" color="text.secondary">
                                    ID: {node.id}
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary">
                                    {new Date(node.timestamp).toLocaleString()}
                                  </Typography>
                                  {node.relationships && node.relationships.map((rel, idx) => (
                                    <Typography key={idx} variant="body2" color="text.secondary">
                                      {rel.relationship.type} → {rel.targetId} 
                                      (Strength: {rel.relationship.properties?.strength?.toFixed(2) || 'N/A'})
                                    </Typography>
                                  ))}
                                </>
                              }
                            />
                            <Button 
                              variant="outlined" 
                              size="small"
                              onClick={() => handleNodeSelect(node.id)}
                            >
                              Explore
                            </Button>
                          </ListItem>
                          {index < recentRelations.length - 1 && <Divider />}
                        </React.Fragment>
                      ))}
                    </List>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>
        
        <TabPanel value={tabValue} index={1}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={selectedNode ? 6 : 12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Knowledge Graph Nodes
                  </Typography>
                  
                  {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                      <CircularProgress />
                    </Box>
                  ) : (
                    <List>
                      {memoryData.slice(0, 10).map((memory, index) => (
                        <React.Fragment key={memory.id}>
                          <ListItem>
                            <ListItemText
                              primary={
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  {renderNodeChip(memory.type)}
                                  <Typography variant="body1">
                                    {memory.content.length > 50 ? `${memory.content.substring(0, 50)}...` : memory.content}
                                  </Typography>
                                </Box>
                              }
                              secondary={
                                <>
                                  <Typography variant="body2" color="text.secondary">
                                    ID: {memory.id}
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary">
                                    {new Date(memory.timestamp).toLocaleString()}
                                  </Typography>
                                </>
                              }
                            />
                            <Button 
                              variant="outlined" 
                              size="small"
                              onClick={() => handleNodeSelect(memory.id)}
                            >
                              Explore
                            </Button>
                          </ListItem>
                          {index < memoryData.length - 1 && <Divider />}
                        </React.Fragment>
                      ))}
                    </List>
                  )}
                </CardContent>
              </Card>
            </Grid>
            
            {selectedNode && (
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Related Nodes for {selectedNode}
                    </Typography>
                    
                    {loading ? (
                      <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                        <CircularProgress />
                      </Box>
                    ) : (
                      <List>
                        {relatedNodes.map((node, index) => (
                          <React.Fragment key={node.id}>
                            <ListItem>
                              <ListItemText
                                primary={
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    {renderNodeChip(node.type)}
                                    <Typography variant="body1">
                                      {node.content.length > 50 ? `${node.content.substring(0, 50)}...` : node.content}
                                    </Typography>
                                  </Box>
                                }
                                secondary={
                                  <>
                                    <Typography variant="body2" color="text.secondary">
                                      ID: {node.id}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                      {new Date(node.timestamp).toLocaleString()}
                                    </Typography>
                                    {node.relationships && node.relationships.map((rel, idx) => (
                                      <Typography key={idx} variant="body2" color="text.secondary">
                                        {rel.relationship.type} → {rel.targetId} 
                                        (Strength: {rel.relationship.properties?.strength?.toFixed(2) || 'N/A'})
                                      </Typography>
                                    ))}
                                  </>
                                }
                              />
                            </ListItem>
                            {index < relatedNodes.length - 1 && <Divider />}
                          </React.Fragment>
                        ))}
                      </List>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            )}
          </Grid>
        </TabPanel>
        
        <TabPanel value={tabValue} index={2}>
          <Typography variant="h6" gutterBottom>
            Vector Memory Matches
          </Typography>
          
          <Box sx={{ mb: 2 }}>
            <Typography variant="body1">
              Enter a query to find semantically similar memories:
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
              <input 
                type="text" 
                style={{ 
                  padding: '8px', 
                  border: '1px solid #ccc', 
                  borderRadius: '4px',
                  flexGrow: 1
                }} 
                placeholder="What emails discuss the quarterly report?" 
              />
              <Button variant="contained">Search</Button>
            </Box>
          </Box>
          
          <Typography variant="body2" color="text.secondary">
            Sample results will appear here. This is a placeholder for the vector similarity search feature.
          </Typography>
        </TabPanel>
        
        <TabPanel value={tabValue} index={3}>
          <Typography variant="h6" gutterBottom>
            Reasoning Engine Visualization
          </Typography>
          
          <Box>
            <Typography variant="body1">
              The reasoning engine traverses the knowledge graph to:
            </Typography>
            <List>
              <ListItem>
                <ListItemText 
                  primary="Link new emails to previous related threads"
                  secondary="Creates PART_OF relationships between emails in the same conversation"
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="Identify relevant past conversations, tasks, or calendar items"
                  secondary="Combines vector similarity with graph traversals for context-aware memory"
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="Infer priority or emotional impact"
                  secondary="Creates temporal reasoning nodes for significant events like stress spikes"
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="Store reasoning paths for later reference"
                  secondary="Explainable AI that shows how conclusions were reached"
                />
              </ListItem>
            </List>
          </Box>
          
          <Box sx={{ mt: 2 }}>
            <Typography variant="body1">
              Sample Reasoning Path:
            </Typography>
            <Paper sx={{ p: 2, bgcolor: '#f5f5f5' }}>
              <Typography variant="body2" component="pre" sx={{ whiteSpace: 'pre-wrap' }}>
                {`EMAIL(email-123) -[SENT_BY]-> PERSON(john@example.com) -[MANAGES]-> TASK(quarterly-report)
                
Explanation: This email is connected to the quarterly report task because it was sent by John who is managing the task. The relationship strength is 0.78.`}
              </Typography>
            </Paper>
          </Box>
        </TabPanel>
      </Paper>
    </Container>
  );
} 