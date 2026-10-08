FAah!! FOOD - JSP UI conversion

Files:
- index.jsp
- css/style.css
- js/script.js

Dynamic restaurant section:
<c:forEach var="restaurant" items="${restaurants}">

Expected Restaurant properties used by the JSP:
- id
- name
- image
- rating
- deliveryTime
- cuisine
- reviewCount (optional)
- priceRange (optional)
- logo (optional)

Servlet must place the restaurant collection in request scope:
request.setAttribute("restaurants", restaurants);

The restaurant image is rendered directly with:
<img src="${restaurant.image}" ...>

No JavaScript/API/database fetching is used for restaurant data.

Important:
The property names must match your actual Java Restaurant model/getters.
If your model uses different names (for example restaurantImage instead of image),
change the corresponding JSP EL expressions.
