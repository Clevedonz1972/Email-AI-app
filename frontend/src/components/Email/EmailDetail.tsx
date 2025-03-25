            {email && (
              <EmailAnalysis 
                email={email}
                analysis={analysis || {
                  stress_level: 'MEDIUM',
                  priority: 'MEDIUM',
                  summary: '',
                  action_items: [],
                  sentiment_score: 0
                }} 
                loading={analysisLoading} 
                error={analysisError} 
                onReply={handleSendReply}
              />
            )} 