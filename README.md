# Boolean Slider

This is an implementation of a boolean slider using just HTML and CSS.

## Contributing

For more information on contributing to this repository visit [Contributing to a GitHub repository](https://world.mendix.com/display/howto50/Contributing+to+a+GitHub+repository)!

## Typical usage scenario

Use this in both mobile and web for an upgrade to a checkbox.

## Usage

Common usage involves changing the colors used. The CSS classes that are most commonly involved are the following:

```css
/* background used in true state */
.wgt-BooleanSlider__input:checked + .wgt-BooleanSlider__toggle {
    background-color: #5198db;
}

/* background used in false state */
.wgt-BooleanSlider__toggle {
    background-color: #ddd;
}

/* color of the circle */
.wgt-BooleanSlider__toggle:before {
    background-color: #fff;
}
```