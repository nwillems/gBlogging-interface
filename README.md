Welcome to an alternate blogging editor interface for google blogger.
For a quick and dirty rundown - you can visit http://nwillems.dk/blogging to
see it in action.

This application(if I may) is designed to do two things:
* Get some more experience in writing completely client side applications
* Make a blog editor that doesn't make bad html.

## Examples of bad HTML ##
Google would make a blog post start like this:
`    <div dir="ltr" style="text-align: left;"> </div>`

That is sort of fine - but when making a double line break, it results in the
following:
`    <div dir="ltr" style="text-align: left;">
    Content
    <br />
    <br />
    some more
    </div>`

Instead, far as my html knowledge goes, this should be something looking like
this:
`    <div dir="ltr" style="text-align: left;">
    <p>Content</p>
    <p>some more</p>
    </div>`

## License ##
Steal/borrow/blog-about/use-it is free of charge, even for commercial use.
As always there is a but, in this case a small one:

But - I would be happy to be notified if you use it or in anyother way find it
interesting or maybee even ugly.

Happy blogging
