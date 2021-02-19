# Setup for NGINX

To ensure your project runs correctly, you may have to edit the `nginx.conf` file.
You may need to edit the file to match this configuration:

```conf
upstream loadbalancer {
    server <containing folder name>_api_1:1000;
    server <containing folder name>_api_2:1000;
}
```

The `<containing folder name>` is the folder name that the entire project is contianed in.
