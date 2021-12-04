# TinyApp Project

TinyApp is a full stack web application built with Node and Express that allows users to shorten long URLs (à la bit.ly).

This project provides edit and delete functions, as well as analytics showing how many times a shortened URL has been visited, how many unique visitors have used this URL, and lists of these visitors and their visits.

## Final Product

Users must login or register prior to being able to access site functions:
!["Main page prior to login or registration"](docs/Tinyapp1_main_new.png)

Creating a shortened URL requires a user to input text. Validation of a valid URL does not take place, and the user can enter any address.
!["Creating a new shortened URL"](docs/Tinyapp2_newURL.png)

Following submission of a URL for shortening, user is redirected to the viewing page for that URL, where they can edit the url it directs to, or completely delete the shortened URL entry.
!["In the view details and edit view of the URL"](docs/Tinyapp3_editview.png)

When the user returns to their main page, they will see a list of all shortened urls they have created, and be able to access the details and analytics of each url.
!["Main page showing all urls that a logged in user has registered"](docs/Tinyapp4_urls-page.png)

The analytics page of each url shows how many times a url has been visited and how many unique visitors have used that url. A list of every independent visit is also generated at the bottom of the page.
!["Analytics page for each url."](docs/Tinyapp5_analytics.png)

## Dependencies

- Node.js
- Express
- EJS
- bcrypt
- body-parser
- cookie-session
- method-override


## Getting Started

- Install all dependencies (using the `npm install` command).
- Run the development web server using the `node express_server.js` command.