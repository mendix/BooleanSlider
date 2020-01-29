# Boolean Slider

> This widget is old and not supported anymore. It does not work in Mendix 8. Please be advised to use the alternative [Slider](https://appstore.home.mendix.com/link/app/50324/) widget for newer Mendix versions.

This is an implementation of a boolean slider using just HTML and CSS.

## Contributing

For more information on contributing to this repository visit [Contributing to a GitHub repository](https://world.mendix.com/display/howto50/Contributing+to+a+GitHub+repository)!

## Typical usage scenario

Use this in both mobile and web for an upgrade to a checkbox.

## Usage

The control uses the Bootstrap classes "btn-primary" for true, and "btn-default" for false, so that it will pick up the colors from your theme automatically. Additionally, you may want to change the toggle (center circle), by using the following:

```css
/* color of the circle */
.wgt-BooleanSlider__toggle:before {
    background-color: #fff;
}
```
