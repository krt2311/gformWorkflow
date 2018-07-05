# gformWorkflow
A google script for automating workflows from google forms via google sheets

This script is dependant on the central function library being pulled into it's project, and requires that any associated google form be harvesting an email address from the form users.

Feature Roadmap:

Intialize Error reporting and attribute confirmation - initialize will only run once all attributes are set and will feedback the desired option, also have a 'reset form' option.

Conditional Routing - Form Ranger add-on for the forms can be used to populate fields that trigger conditional routing, will write an extension to the intialize function to create a separate sheet to specify value/email pairs which can than be used via form ranger to dynamically manage drop down lists

Move script attributes to config sheet - update initialize function to harvest global attributes from a config sheet rather than sheet property attributes, more human centric workflow creation

Google Sites Dashboards - Dashboards to monitor workflows and eroors.

Bulk email workflow - A tracking workflow type to create extra sheets within the responses sheet linking to dashboards to track acceptance and progress of staff initiated form campaigns.

Single and Double approval workflow - change approval email generation to use doGet as most mobile mail clients don't support HTML forms. Create custom final acceptance / rejection emails to the form initiator once the workflow is complete.

Contribution workflow - create email form input fields harvested into an a href get request to the web app where extra input

HR System integration - update subsheet data with HR system data... feedback into HR system would most likely require node dev though, at first would only facilitate data extraction
