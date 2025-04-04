import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { initializeGmail, loginToGmail, getEmails, selectEmail } from '../store/emailSlice';
import { useAppDispatch, useAppSelector } from '../hooks/reduxHooks';
import Button from '../components/common/Button';
import { reinitializeGmail } from '../store/emailSlice';

const EmailContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
`;

const EmailHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  font-size: 2rem;
  color: #2d4b6e;
`;

const EmailList = styled.div`
  flex: 1;
  border-right: 1px solid #e0e0e0;
  padding-right: 1rem;
  overflow-y: auto;
  height: 600px;
`;

const EmailDetail = styled.div`
  flex: 2;
  padding-left: 1rem;
  overflow-y: auto;
  height: 600px;
`;

const EmailLayout = styled.div`
  display: flex;
  gap: 2rem;
`;

const EmailItem = styled.div<{ isSelected: boolean, isRead: boolean }>`
  padding: 1rem;
  border-bottom: 1px solid #e0e0e0;
  cursor: pointer;
  background-color: ${props => props.isSelected ? '#f0f7ff' : 'white'};
  font-weight: ${props => !props.isRead ? 'bold' : 'normal'};

  &:hover {
    background-color: ${props => props.isSelected ? '#f0f7ff' : '#f5f7fa'};
  }
`;

const EmailSubject = styled.h3`
  margin: 0 0 0.5rem 0;
  font-size: 1rem;
`;

const EmailSender = styled.div`
  font-size: 0.9rem;
  color: #666;
`;

const EmailSnippet = styled.p`
  margin: 0.5rem 0 0 0;
  font-size: 0.9rem;
  color: #666;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const EmailDate = styled.div`
  font-size: 0.8rem;
  color: #999;
  text-align: right;
`;

const EmailDetailHeader = styled.div`
  padding-bottom: 1rem;
  border-bottom: 1px solid #e0e0e0;
`;

const EmailDetailSubject = styled.h2`
  margin: 0 0 1rem 0;
`;

const EmailDetailSender = styled.div`
  margin-bottom: 0.5rem;
`;

const EmailDetailDate = styled.div`
  color: #666;
  margin-bottom: 1rem;
`;

const EmailDetailBody = styled.div`
  margin-top: 1rem;
  white-space: pre-wrap;
`;

const NoEmailSelected = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #666;
`;

const ActionBar = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
`;

const getCleanTextFromHtml = (html: string | undefined): string => {
    if (!html) return '';
    
    // Create a temporary DOM element
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    
    // Get text content (this removes all HTML)
    let text = tempDiv.textContent || tempDiv.innerText || '';
    
    // Trim and limit length
    text = text.trim();
    if (text.length > 300) {
      text = text.substring(0, 297) + '...';
    }
    
    return text;
  };

  const renderEmailContent = (content: string | undefined) => {
    if (!content) return null; // Return null if content is undefined
    return <div dangerouslySetInnerHTML={{ __html: content }} />;
  };

const EmailPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  
  const { user } = useAppSelector((state) => state.auth);
  const { 
    isInitialized, 
    isSignedIn, 
    emails, 
    selectedEmail, 
    isLoading 
  } = useAppSelector((state) => state.email);
  
  const [selectedEmailId, setSelectedEmailId] = useState<string | null>(null);
  
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    // Initialize Gmail API if not already done
    if (!isInitialized) {
      dispatch(initializeGmail());
    }
  }, [user, dispatch, navigate, isInitialized]);

  useEffect(() => {
    console.log("Email state:", {
      isInitialized,
      isSignedIn,
      emails: emails.length,
      selectedEmail,
      isLoading
    });
  }, [isInitialized, isSignedIn, emails, selectedEmail, isLoading]);
  
  useEffect(() => {
    if (isInitialized && !isSignedIn) {
      // Prompt sign in if API is initialized but not signed in
      const handleSignIn = async () => {
        try {
          await dispatch(loginToGmail()).unwrap();
          // Load emails after successful sign-in
          console.log('Gmail signed in, fetching emails...');
          dispatch(getEmails(20))
            .then(result => {
              console.log('Emails fetched:', result);
            })
            .catch(err => {
              console.error('Error fetching emails:', err);
            });
        } catch (error) {
          console.error('Failed to sign in to Gmail', error);
        }
      };
      
      handleSignIn();
    } else if (isInitialized && isSignedIn) {
      // Load emails if already signed in
      console.log('Already signed in to Gmail, fetching emails...');
      dispatch(getEmails(20))
        .then(result => {
          console.log('Emails fetched:', result);
        })
        .catch(err => {
          console.error('Error fetching emails:', err);
        });
    }
  }, [isInitialized, isSignedIn, dispatch]);
  
  const handleEmailSelect = (emailId: string) => {
    setSelectedEmailId(emailId);
    dispatch(selectEmail(emailId));
  };
  
  const handleCreateTask = () => {
    if (selectedEmail) {
      navigate('/tasks/new', { 
        state: { 
          fromEmail: true, 
          emailSubject: selectedEmail.subject,
          emailBody: getCleanTextFromHtml(selectedEmail.body),
          emailId: selectedEmail.id
        } 
      });
    }
  };
  
  const formatDate = (date: Date) => {
    const now = new Date();
    const emailDate = new Date(date);
    
    // If it's today, just show the time
    if (emailDate.toDateString() === now.toDateString()) {
      return emailDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    // If it's this year, show month and day
    if (emailDate.getFullYear() === now.getFullYear()) {
      return emailDate.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
    
    // Otherwise show full date
    return emailDate.toLocaleDateString();
  };
  
  if (isLoading) {
    console.log("EmailPage render:", { 
        isInitialized, 
        isSignedIn, 
        emailsCount: emails.length, 
        isLoading 
      });
    return (
      <EmailContainer>
        <p>Loading emails...</p>
      </EmailContainer>
    );
  }
  
  return (
    <EmailContainer>
      <EmailHeader>
        <Title>Your Emails</Title>
        <div>
          {!isSignedIn && (
            <Button onClick={() => dispatch(loginToGmail())} style={{ marginRight: '1rem' }}>
              Connect Gmail
            </Button>
          )}
          <Button primary onClick={() => {
            console.log("Refreshing emails...");
            dispatch(getEmails(20))
                .unwrap()
                .then(result => {
                console.log("Email refresh result:", result);
                })
                .catch(err => {
                console.error("Email refresh error:", err);
                });
            }}>
            Refresh Emails
          </Button>
          <Button onClick={() => dispatch(reinitializeGmail())}>
            Reset Gmail Connection
          </Button>
        </div>
      </EmailHeader>
      
      <EmailLayout>
        <EmailList>
          {emails.length === 0 ? (
            <p>No emails found</p>
          ) : (
            emails.map((email) => (
              <EmailItem 
                key={email.id}
                isSelected={email.id === selectedEmailId}
                isRead={email.isRead}
                onClick={() => handleEmailSelect(email.id)}
              >
                <EmailSubject>{email.subject}</EmailSubject>
                <EmailSender>{email.from}</EmailSender>
                <EmailSnippet>{email.snippet}</EmailSnippet>
                <EmailDate>{formatDate(email.date)}</EmailDate>
              </EmailItem>
            ))
          )}
        </EmailList>
        
        <EmailDetail>
          {selectedEmail ? (
            <>
              <EmailDetailHeader>
                <EmailDetailSubject>{selectedEmail.subject}</EmailDetailSubject>
                <EmailDetailSender>
                  <strong>From:</strong> {selectedEmail.from}
                </EmailDetailSender>
                <EmailDetailSender>
                  <strong>To:</strong> {selectedEmail.to.join(', ')}
                </EmailDetailSender>
                <EmailDetailDate>
                  {new Date(selectedEmail.date).toLocaleString()}
                </EmailDetailDate>
                
                <ActionBar>
                  <Button primary onClick={handleCreateTask}>
                    Create Task from Email
                  </Button>
                </ActionBar>
              </EmailDetailHeader>
              
              <EmailDetailBody>
                {renderEmailContent(selectedEmail.body)}
              </EmailDetailBody>
            </>
          ) : (
            <NoEmailSelected>
              <p>Select an email to view its contents</p>
            </NoEmailSelected>
          )}
        </EmailDetail>
      </EmailLayout>
    </EmailContainer>
  );
};

export default EmailPage;