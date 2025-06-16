# ShowingTime Integration Setup Guide

## Overview

The ShowingTime integration allows Commission Guard to automatically import scheduled showings from your ShowingTime account, creating a seamless workflow between appointment scheduling and commission protection.

## Prerequisites

1. **Active ShowingTime Account**: You must have an active ShowingTime account with scheduled appointments
2. **API Access**: ShowingTime API credentials (contact ShowingTime support for API access)
3. **Agent Email Match**: Your Commission Guard profile email must match your ShowingTime account email

## Setup Steps

### 1. Obtain ShowingTime API Credentials

Contact ShowingTime support to request API access:
- **Email**: support@showingtime.com
- **Phone**: 1-888-671-9505
- **Required Information**:
  - Your ShowingTime account details
  - Business verification documentation
  - Intended use case (Commission Guard integration)

### 2. Configure Environment Variables

Add the following environment variables to your Replit project:

```
SHOWINGTIME_API_KEY=your_api_key_here
SHOWINGTIME_BASE_URL=https://api.showingtime.com/v1
```

### 3. Verify Agent Email

Ensure your Commission Guard profile email matches your ShowingTime account:
1. Go to Profile Settings in Commission Guard
2. Verify your email address matches ShowingTime
3. Update if necessary

### 4. Test the Integration

1. Navigate to **ShowingTime Integration** from the main menu
2. Click **Test Connection** to verify API connectivity
3. If successful, you'll see a "Connected" status

### 5. Import Appointments

**Automatic Sync:**
- Click **Sync All Appointments** to import all upcoming appointments
- This will automatically create:
  - Property records for each appointment address
  - Client records (when contact information is available)
  - Showing records with commission protection enabled

**Manual Import:**
- Review individual appointments in the list
- Select specific appointments to import
- Click **Import Selected** for granular control

## Features

### Automated Data Creation

The integration automatically creates:
- **Properties**: Based on appointment addresses
- **Clients**: From appointment contact information
- **Showings**: With full appointment details
- **Commission Protection**: Automatically enabled for all imported showings

### Sync Capabilities

- **Real-time Status**: View connection status and sync statistics
- **Bulk Import**: Import multiple appointments at once
- **Selective Import**: Choose specific appointments to import
- **Update Handling**: Automatically updates existing appointments

### Data Mapping

ShowingTime appointments are mapped to Commission Guard as follows:

| ShowingTime Field | Commission Guard Field |
|-------------------|------------------------|
| Property Address | Property.address |
| Client Name | Client.fullName |
| Client Email | Client.email |
| Client Phone | Client.phone |
| Scheduled Date/Time | Showing.scheduledDate |
| Appointment Type | Showing.showingType |
| Instructions | Showing.agentNotes |
| Confirmation Number | Reference tracking |

## Troubleshooting

### Connection Issues

**Problem**: "Not Connected" status
**Solutions**:
1. Verify API key is correctly configured
2. Check that your email matches ShowingTime account
3. Ensure ShowingTime API access is active
4. Contact ShowingTime support if credentials are invalid

### Import Failures

**Problem**: Appointments fail to import
**Solutions**:
1. Check that appointments have valid addresses
2. Verify appointment dates are in the future
3. Ensure no duplicate appointments exist
4. Review error messages for specific issues

### Missing Data

**Problem**: Client information not importing
**Solutions**:
1. Verify ShowingTime appointments include client details
2. Check that client contact information is properly formatted
3. Ensure privacy settings allow data sharing

## Best Practices

### Regular Syncing
- Sync appointments daily or before important meetings
- Monitor sync status for any connection issues
- Keep ShowingTime appointments up to date

### Data Management
- Review imported data for accuracy
- Update client information as needed
- Verify property addresses are correctly geocoded

### Commission Protection
- All imported showings automatically enable commission protection
- Review protection settings for high-value properties
- Document any special commission arrangements

## Support

### Technical Issues
- Check the integration status page for connection details
- Review error logs in the developer console
- Contact Commission Guard support for integration-specific issues

### ShowingTime Support
- **API Issues**: Contact ShowingTime developer support
- **Account Access**: Contact your ShowingTime account manager
- **Data Questions**: Review ShowingTime documentation

## Security

### Data Protection
- All API communications use HTTPS encryption
- ShowingTime credentials are securely stored
- Client data follows privacy protection standards

### Access Control
- Only authenticated agents can access integration features
- API keys are protected and not visible in the interface
- Sync operations are logged for audit purposes

## Updates

The ShowingTime integration is continuously improved with:
- Enhanced data mapping capabilities
- Improved error handling and recovery
- Additional sync options and features
- Better performance and reliability

For the latest updates and announcements, check the Commission Guard release notes.