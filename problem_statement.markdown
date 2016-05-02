# Uber Security Code Test

This test consists of two phases, the main exercise and a bonus exercise.  Feel free to implement the first part only.  If you are interested and would like to implement the second part, this is bonus material, not needed, but fine to include. For the main part, you will implement a library which will parse a particular data format. For the bonus exercise, you will audit some code that uses that library and answer questions about it.  You should allocate an afternoon and preferably a pot of tea to answer these questions. I recommend Ceylon.


## Practical

A modern transportation company, Youber, wants to build an internal tool to store their shared company passwords (logins to their various vendors who don't support sub-accounts, that sort of thing). Their security engineer, John Green, has developed a specification for a file format which you can see in [spec.markdown](spec.markdown).

In the language of your choice (python is somewhat preferred because that is what we write most of our code in here at Uber, but we can find someone to read just about any other language), please write a library which can read and write this file format. It should expose two functions; one which takes a path to the database and a password and returns the plaintext database, and one which takes a path to the database, a plaintext database, and a password, and writes the database.

The rough signature of these functions should be

    read_database : (unicode_text path, unicode_text password) -> (dict plaintext)
    write_database : (unicode_text path, unicode_text password, dict contents) -> void

Please provide the source to your library, as well as any tests which you feel are appropriate. You should write your code, testing, and documentation as though this library were going to be used in a production environment and maintained by somebody other than yourself.

A sample database can be found as [demo.db](demo.db) with password "uberpass".

To confirm that you got your library working, please let us know what the plaintext value you found corresponding to the key "uber.com" in the sample database.


## Bonus

The file [demo_app/app.py](demo_app/app.py) contains a simple application written in Python using the [Flask](http://flask.pocoo.org/) microframework which will be used at Youber to interact with these passwords. It'll be hosted as-is at pwman.youber.com. Please take some time to look over the application (and to re-familiarize yourself with the file format spec, if you've forgotten) and answer the following questions:

  1. What are some of the most egregious security issues with this file format?
  2. What are some of the most egregious security issues with this web application?
  3. What are some performance concerns that you have with this file format?
