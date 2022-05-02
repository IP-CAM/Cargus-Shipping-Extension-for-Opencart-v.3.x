## Cargus OpenCart module installation manual

### Subscribe to API

- Access https://urgentcargus.portal.azure-api.net/
- Click the 'Sign up' button and fill in the form (you can not use the credentials that the client has for WebExpress)
- Confirm your registration by clicking on the link you received by mail (a real email address should be used)
- On the https://urgentcargus.portal.azure-api.net/developer page, click on `PRODUCTS` in the menu, then`
   UrgentOnlineAPI` and click 'Subscribe', then 'Confirm'
- After the Cargus team confirms subscription to the API, the customer receives a confirmation email
- On the https://urgentcargus.portal.azure-api.net/developer page, click on the user name at the top right, then click
   `Profile '
- The two subscription keys are masked by the characters `xxx ... xxx` and 'Show` in the right of each for display
- It is recommended to use `Primary key` in the Cargus module

### Installing the Module

- In the OpenCart admin, `Extensions' and 'Extension Installer' are accessed
- Click `Upload 'to choose' cargus.ocmod.zip`, followed by` Continue`
- After extensions are confirmed, `Extensions' and 'Modifications' are accessed
- Click the blue refresh button at the top right of the page
- In the main menu on the left side there will be 2 new options, called `Cargus` and `Cargus Ship and Go`
- To install shipping extensions, go to  `Extensions` -> `Extensions`, choose Shipping and loook for `Cargus` and `Cargus Ship and Go` methods and click install
- Go to the 'Cargus' page, then 'Configuration' and fill in the form, followed by the 'Save' blue button at the top
   right of the page


### Configuring the Module

- API Url: https://urgentcargus.azure-api.net/api
- Subscription Key: Primary key obtained in step A. Subscription to API
- Username: username of the client account in the WebExpress platform
- Password: The password for the account mentioned above
- Tax Class: Choose the class of VAT charges in Romania, usually the same as for products
- Geo Zone: Choose the geographic region where the Cargus delivery method is available
- Status: Choose whether the delivery method is active or not
- Sort Order: adds a numerical value related to the order between the other active delivery methods

### Setting Preferences in app

- Go to the 'Cargus' page, then 'Preferences' and fill in the form, followed by the 'Save' blue button at the top
   right of the page
- Pickup Location: Choose one of the available pickup points. If there is no available pickup point, one of WebExpress
   should be added
- Insurance: choose whether the delivery is with or without insurance
- Saturday Delivery: Choose whether delivery is allowed on Saturdays
- Morning Delivery: Choose if the morning delivery service is used
- Open Package: Choose whether the package opening service is used
- Repayment: Choose the type of repayment - Cash or Bank (Collector Account)
- Payer: Choose the cost of delivery - Sender or Recipinet (Consignee)
- Default shipment type: choose the usual expedition type - Parcel or Envelope (Envelope)
- Free shipping limit: enter the limit for which larger purchases benefit of free shipping (payment of the shipment is
    done automatically to the sender)
- Pickup from Cargus: it is possible to choose whether the package can be picked up by the recipient of the
    nearest Cargus warehouse
- Fixed shipping price: Choose a fixed cost of delivery or leave blank, so the module automatically calculates the
    tariff
- Go to the 'Cargus Ship and Go' page, then 'Preferences' and fill in the form, followed by the 'Save' blue button at the top
   right of the page
   - Free shipping limit: enter the limit for which larger purchases benefit of free shipping (payment of the shipment is
    done automatically to the sender)
   - Fixed shipping price: Choose a fixed cost of delivery or leave blank, so the module automatically calculates the
    tariff
   - Status: Has 2 option enabled or disabled. If enabled, the sipping method will be available in checkout.
