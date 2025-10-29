import apper from 'https://cdn.apper.io/actions/apper-actions.js';

apper.serve(async (req) => {
  try {
    // Parse request body
    const body = await req.json();
    
    // Validate required fields
    if (!body.name || typeof body.name !== 'string') {
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Contact name is required and must be a string'
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    
    if (!body.email || typeof body.email !== 'string') {
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Contact email is required and must be a string'
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    
    // Retrieve CompanyHub API key from secrets
    const apiKey = await apper.getSecret('COMPANYHUB_API_KEY');
    
    if (!apiKey) {
      return new Response(
        JSON.stringify({
          success: false,
          message: 'CompanyHub API key not configured in secrets'
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    
    // Prepare contact data for CompanyHub API
    const companyHubContactData = {
      name: body.name,
      email: body.email,
      phone: body.phone || '',
      company: body.company || '',
      tags: body.tags || '',
      notes: body.notes || ''
    };
    
    // Make request to CompanyHub API
    const companyHubResponse = await fetch('https://api.companyhub.com/v1/contacts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(companyHubContactData)
    });
    
    // Check if CompanyHub API request was successful
    if (!companyHubResponse.ok) {
      const errorText = await companyHubResponse.text();
      return new Response(
        JSON.stringify({
          success: false,
          message: `CompanyHub API error: ${companyHubResponse.status} - ${errorText}`
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    
    // Parse CompanyHub response
    const companyHubData = await companyHubResponse.json();
    
    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Contact created in CompanyHub successfully',
        data: companyHubData
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
    
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        message: `Failed to create contact in CompanyHub: ${error.message}`
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
});